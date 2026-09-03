from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from expense.database import get_db
from expense.schemas.expense import (
    ExpenseCreate,
    ExpenseUpdate,
    ExpenseResponse,
    ExpenseCalculateRequest,
    ExpenseCalculateResponse
)
from expense.services import expense_service

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.post("/calculate", response_model=ExpenseCalculateResponse, status_code=status.HTTP_200_OK)
def preview_calculate_expense(
    request: ExpenseCalculateRequest, db: Session = Depends(get_db)
):
    return expense_service.calculate_expense_shares(request, db=db)

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(expense_in: ExpenseCreate, db: Session = Depends(get_db)):
    return expense_service.create_expense(db, expense_in)

@router.get("", response_model=List[ExpenseResponse])
def list_expenses(db: Session = Depends(get_db)):
    return expense_service.get_expenses(db)

@router.get("/{id}", response_model=ExpenseResponse)
def get_expense(id: int, db: Session = Depends(get_db)):
    return expense_service.get_expense_by_id(db, id)

@router.put("/{id}", response_model=ExpenseResponse)
def update_expense(id: int, expense_in: ExpenseUpdate, db: Session = Depends(get_db)):
    return expense_service.update_expense(db, id, expense_in)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_expense(id: int, db: Session = Depends(get_db)):
    expense_service.delete_expense(db, id)
    return {"detail": f"Expense {id} deleted successfully"}
