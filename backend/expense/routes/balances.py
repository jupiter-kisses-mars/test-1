from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import security
import models
from expense.database import get_db
from expense.schemas.balance import BalancesResponse, SettlementsResponse
from expense.services import balance_service

router = APIRouter(prefix="/api/balances", tags=["Balances"])

@router.get("", response_model=BalancesResponse)
def get_balances(trip_id: Optional[int] = None, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(security.get_current_user_optional)):
    return balance_service.calculate_user_balances(db, trip_id=trip_id)

@router.get("/settlements", response_model=SettlementsResponse)
def get_settlements(trip_id: Optional[int] = None, db: Session = Depends(get_db), current_user: Optional[models.User] = Depends(security.get_current_user_optional)):
    return balance_service.calculate_settlements(db, trip_id=trip_id)
