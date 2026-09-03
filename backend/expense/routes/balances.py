from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from expense.database import get_db
from expense.schemas.balance import BalancesResponse, SettlementsResponse
from expense.services import balance_service

router = APIRouter(prefix="/api/balances", tags=["Balances"])

@router.get("", response_model=BalancesResponse)
def get_balances(db: Session = Depends(get_db)):
    return balance_service.calculate_user_balances(db)

@router.get("/settlements", response_model=SettlementsResponse)
def get_settlements(db: Session = Depends(get_db)):
    return balance_service.calculate_settlements(db)
