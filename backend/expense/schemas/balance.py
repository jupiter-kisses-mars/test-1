from pydantic import BaseModel, ConfigDict
from decimal import Decimal
from typing import List

class UserBalance(BaseModel):
    user_id: int
    user_name: str
    balance: Decimal

    model_config = ConfigDict(from_attributes=True)

class BalancesResponse(BaseModel):
    balances: List[UserBalance]

class Settlement(BaseModel):
    from_user_id: int
    from_user_name: str
    to_user_id: int
    to_user_name: str
    amount: Decimal

class SettlementsResponse(BaseModel):
    settlements: List[Settlement]
