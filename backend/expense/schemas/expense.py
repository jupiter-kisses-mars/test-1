from pydantic import BaseModel, ConfigDict, Field, model_validator
from decimal import Decimal
from datetime import datetime
from typing import List, Optional, Literal

class ParticipantInput(BaseModel):
    user_id: int
    share_amount: Optional[Decimal] = Field(default=None, ge=0)

class ParticipantResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    share_amount: Decimal

    model_config = ConfigDict(from_attributes=True)

class ExpenseCalculateRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, description="Total expense amount, must be positive")
    paid_by: int
    participants: List[ParticipantInput]
    split_type: Literal["equal", "custom"]

    @model_validator(mode="after")
    def validate_request(self):
        if not self.participants:
            raise ValueError("Participants list cannot be empty")
        
        user_ids = [p.user_id for p in self.participants]
        if len(user_ids) != len(set(user_ids)):
            raise ValueError("Duplicate participants are not allowed")
            
        return self

class CalculatedShare(BaseModel):
    user_id: int
    share_amount: Decimal

class ExpenseCalculateResponse(BaseModel):
    amount: Decimal
    paid_by: int
    split_type: str
    shares: List[CalculatedShare]

class ExpenseCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=255)
    amount: Decimal = Field(..., gt=0, description="Total expense amount, must be positive")
    paid_by: int
    split_type: Literal["equal", "custom"]
    participants: List[ParticipantInput]

    @model_validator(mode="after")
    def validate_expense(self):
        if not self.participants:
            raise ValueError("Participants list cannot be empty")
        
        user_ids = [p.user_id for p in self.participants]
        if len(user_ids) != len(set(user_ids)):
            raise ValueError("Duplicate participants are not allowed")
            
        return self

class ExpenseUpdate(BaseModel):
    description: Optional[str] = Field(default=None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(default=None, gt=0)
    paid_by: Optional[int] = None
    split_type: Optional[Literal["equal", "custom"]] = None
    participants: Optional[List[ParticipantInput]] = None

class ExpenseResponse(BaseModel):
    id: int
    description: str
    amount: Decimal
    paid_by: int
    payer_name: Optional[str] = None
    split_type: str
    created_at: datetime
    updated_at: datetime
    participants: List[ParticipantResponse]

    model_config = ConfigDict(from_attributes=True)
