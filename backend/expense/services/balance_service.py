from decimal import Decimal
from typing import List, Dict, Optional
from sqlalchemy.orm import Session, joinedload

from expense.models.user import User
from expense.models.expense import Expense
from expense.schemas.balance import (
    UserBalance,
    BalancesResponse,
    Settlement,
    SettlementsResponse
)
from expense.utils.money import round_money


def calculate_user_balances(db: Session, trip_id: Optional[int] = None) -> BalancesResponse:
    users = db.query(User).order_by(User.id.asc()).all()
    user_balances: Dict[int, Decimal] = {u.id: Decimal("0.00") for u in users}
    user_names: Dict[int, str] = {u.id: (getattr(u, "name", None) or getattr(u, "full_name", None) or f"User #{u.id}") for u in users}

    query = db.query(Expense).options(joinedload(Expense.participants))
    if trip_id is not None:
        query = query.filter(Expense.trip_id == trip_id)
    expenses = query.all()

    for exp in expenses:
        if exp.paid_by in user_balances:
            user_balances[exp.paid_by] += Decimal(str(exp.amount))
        
        for part in exp.participants:
            if part.user_id in user_balances:
                user_balances[part.user_id] -= Decimal(str(part.share_amount))

    result: List[UserBalance] = []
    for uid, u_name in user_names.items():
        net_amount = round_money(user_balances.get(uid, Decimal("0.00")))
        result.append(
            UserBalance(
                user_id=uid,
                user_name=u_name,
                balance=net_amount
            )
        )

    return BalancesResponse(balances=result)


def calculate_settlements(db: Session, trip_id: Optional[int] = None) -> SettlementsResponse:
    balances_res = calculate_user_balances(db, trip_id=trip_id)
    
    debtors = []
    creditors = []

    for b in balances_res.balances:
        if b.balance < Decimal("0.00"):
            debtors.append({
                "id": b.user_id,
                "name": b.user_name,
                "amount": -b.balance
            })
        elif b.balance > Decimal("0.00"):
            creditors.append({
                "id": b.user_id,
                "name": b.user_name,
                "amount": b.balance
            })

    settlements: List[Settlement] = []

    debtors.sort(key=lambda x: x["amount"], reverse=True)
    creditors.sort(key=lambda x: x["amount"], reverse=True)

    d_idx = 0
    c_idx = 0

    while d_idx < len(debtors) and c_idx < len(creditors):
        debtor = debtors[d_idx]
        creditor = creditors[c_idx]

        settle_amt = min(debtor["amount"], creditor["amount"])
        settle_amt = round_money(settle_amt)

        if settle_amt > Decimal("0.00"):
            settlements.append(
                Settlement(
                    from_user_id=debtor["id"],
                    from_user_name=debtor["name"],
                    to_user_id=creditor["id"],
                    to_user_name=creditor["name"],
                    amount=settle_amt
                )
            )

        debtor["amount"] = round_money(debtor["amount"] - settle_amt)
        creditor["amount"] = round_money(creditor["amount"] - settle_amt)

        if debtor["amount"] <= Decimal("0.00"):
            d_idx += 1
        if creditor["amount"] <= Decimal("0.00"):
            c_idx += 1


    return SettlementsResponse(settlements=settlements)
