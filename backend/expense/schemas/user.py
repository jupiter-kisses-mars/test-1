from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="User name")

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
