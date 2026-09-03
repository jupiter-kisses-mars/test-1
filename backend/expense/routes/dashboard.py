from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from expense.database import get_db
from expense.models.user import User
from expense.models.expense import Expense
from expense.schemas.dashboard import DashboardSummary
from expense.services import expense_service
from expense.utils.money import round_money

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_expenses_count = db.query(func.count(Expense.id)).scalar() or 0
    total_expenses_amount = db.query(func.sum(Expense.amount)).scalar() or Decimal("0.00")
    
    recent_expenses = expense_service.get_expenses(db)[:5]

    return DashboardSummary(
        total_users=total_users,
        total_expenses_count=total_expenses_count,
        total_expenses_amount=round_money(Decimal(str(total_expenses_amount))),
        recent_expenses=recent_expenses
    )
