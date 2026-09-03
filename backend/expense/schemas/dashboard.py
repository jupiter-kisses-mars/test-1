from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from typing import List
from expense.schemas.expense import ExpenseResponse

class DashboardSummary(BaseModel):
    total_users: int
    total_expenses_count: int
    total_expenses_amount: Decimal
    recent_expenses: List[ExpenseResponse]

    model_config = ConfigDict(from_attributes=True)
