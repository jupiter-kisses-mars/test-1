from pydantic import BaseModel, ConfigDict, Field, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="User name")
    email: Optional[EmailStr] = Field(None, description="User email address")

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    full_name: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

