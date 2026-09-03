from decimal import Decimal
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from expense.models.user import User
from expense.models.expense import Expense, ExpenseParticipant
from expense.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseCalculateRequest,
    ExpenseCalculateResponse,
    CalculatedShare,
    ExpenseResponse,
    ParticipantResponse
)
from expense.utils.money import round_money, calculate_equal_split


def _validate_users_exist(db: Session, paid_by: int, participant_ids: List[int]):
    """Verify paid_by and all participant users exist in database."""
    all_user_ids = set([paid_by] + participant_ids)
    existing_users = db.query(User.id).filter(User.id.in_(all_user_ids)).all()
    existing_ids = {u[0] for u in existing_users}

    if paid_by not in existing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payer user with id {paid_by} not found"
        )
    
    missing = [uid for uid in participant_ids if uid not in existing_ids]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Participant user(s) with id(s) {missing} not found"
        )


def calculate_expense_shares(
    request: ExpenseCalculateRequest, db: Session = None
) -> ExpenseCalculateResponse:
    """Calculate participant shares without saving to DB."""
    if request.amount <= Decimal("0"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expense amount must be greater than zero"
        )

    if not request.participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Participants list cannot be empty"
        )

    participant_ids = [p.user_id for p in request.participants]
    if len(participant_ids) != len(set(participant_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate participants are not allowed"
        )

    if db is not None:
        _validate_users_exist(db, request.paid_by, participant_ids)

    amount = round_money(request.amount)
    calculated_shares: List[CalculatedShare] = []

    if request.split_type == "equal":
        shares = calculate_equal_split(amount, len(request.participants))
        for p, share_val in zip(request.participants, shares):
            calculated_shares.append(
                CalculatedShare(user_id=p.user_id, share_amount=share_val)
            )

    elif request.split_type == "custom":
        total_custom_share = Decimal("0.00")
        for p in request.participants:
            if p.share_amount is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Custom split requires share_amount for user {p.user_id}"
                )
            if p.share_amount < Decimal("0"):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Share amount for user {p.user_id} cannot be negative"
                )
            share_val = round_money(p.share_amount)
            total_custom_share += share_val
            calculated_shares.append(
                CalculatedShare(user_id=p.user_id, share_amount=share_val)
            )

        if round_money(total_custom_share) != amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Sum of custom shares ({total_custom_share}) does not equal "
                    f"total expense amount ({amount})"
                )
            )

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid split_type: {request.split_type}"
        )

    return ExpenseCalculateResponse(
        amount=amount,
        paid_by=request.paid_by,
        split_type=request.split_type,
        shares=calculated_shares
    )


def create_expense(db: Session, expense_in: ExpenseCreate) -> ExpenseResponse:
    """Create a new expense with participants inside a database transaction."""
    calc_req = ExpenseCalculateRequest(
        amount=expense_in.amount,
        paid_by=expense_in.paid_by,
        participants=expense_in.participants,
        split_type=expense_in.split_type
    )
    calc_res = calculate_expense_shares(calc_req, db=db)

    try:
        expense = Expense(
            description=expense_in.description.strip(),
            amount=calc_res.amount,
            paid_by=expense_in.paid_by,
            split_type=expense_in.split_type
        )
        db.add(expense)
        db.flush()

        for s in calc_res.shares:
            part = ExpenseParticipant(
                expense_id=expense.id,
                user_id=s.user_id,
                share_amount=s.share_amount
            )
            db.add(part)

        db.commit()
        db.refresh(expense)
        return get_expense_by_id(db, expense.id)
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create expense: {str(e)}"
        )


def _format_expense_response(db: Session, expense: Expense) -> ExpenseResponse:
    user_ids = set([expense.paid_by] + [p.user_id for p in expense.participants])
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    user_map = {u.id: u.name for u in users}

    participant_responses = [
        ParticipantResponse(
            id=p.id,
            user_id=p.user_id,
            user_name=user_map.get(p.user_id, "Unknown"),
            share_amount=p.share_amount
        )
        for p in expense.participants
    ]

    return ExpenseResponse(
        id=expense.id,
        description=expense.description,
        amount=expense.amount,
        paid_by=expense.paid_by,
        payer_name=user_map.get(expense.paid_by, "Unknown"),
        split_type=expense.split_type,
        created_at=expense.created_at,
        updated_at=expense.updated_at,
        participants=participant_responses
    )


def get_expense_by_id(db: Session, expense_id: int) -> ExpenseResponse:
    expense = (
        db.query(Expense)
        .options(joinedload(Expense.participants))
        .filter(Expense.id == expense_id)
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id {expense_id} not found"
        )
    return _format_expense_response(db, expense)


def get_expenses(db: Session) -> List[ExpenseResponse]:
    expenses = (
        db.query(Expense)
        .options(joinedload(Expense.participants))
        .order_by(Expense.created_at.desc())
        .all()
    )
    return [_format_expense_response(db, e) for e in expenses]


def update_expense(db: Session, expense_id: int, expense_in: ExpenseUpdate) -> ExpenseResponse:
    expense = (
        db.query(Expense)
        .options(joinedload(Expense.participants))
        .filter(Expense.id == expense_id)
        .first()
    )
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id {expense_id} not found"
        )

    new_description = (
        expense_in.description.strip()
        if expense_in.description is not None
        else expense.description
    )
    new_amount = expense_in.amount if expense_in.amount is not None else expense.amount
    new_paid_by = expense_in.paid_by if expense_in.paid_by is not None else expense.paid_by
    new_split_type = (
        expense_in.split_type if expense_in.split_type is not None else expense.split_type
    )

    if expense_in.participants is not None:
        new_participants = expense_in.participants
    else:
        new_participants = [
            {"user_id": p.user_id, "share_amount": p.share_amount}
            for p in expense.participants
        ]

    calc_req = ExpenseCalculateRequest(
        amount=new_amount,
        paid_by=new_paid_by,
        participants=new_participants,
        split_type=new_split_type
    )
    calc_res = calculate_expense_shares(calc_req, db=db)

    try:
        expense.description = new_description
        expense.amount = calc_res.amount
        expense.paid_by = new_paid_by
        expense.split_type = new_split_type

        db.query(ExpenseParticipant).filter(
            ExpenseParticipant.expense_id == expense.id
        ).delete()

        for s in calc_res.shares:
            part = ExpenseParticipant(
                expense_id=expense.id,
                user_id=s.user_id,
                share_amount=s.share_amount
            )
            db.add(part)

        db.commit()
        db.refresh(expense)
        return get_expense_by_id(db, expense.id)
    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update expense: {str(e)}"
        )


def delete_expense(db: Session, expense_id: int) -> None:
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id {expense_id} not found"
        )
    try:
        db.delete(expense)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete expense: {str(e)}"
        )
