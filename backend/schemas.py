from pydantic import BaseModel, EmailStr, ConfigDict, model_validator
from datetime import datetime
from typing import Optional

# Base schema shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

# Schema for creating a user (Registration)
class UserCreate(UserBase):
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

# Schema for User Login request
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Schema for User response (Excludes sensitive password data)
class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Token Response Schema
class Token(BaseModel):
    access_token: str
    token_type: str

# Token Data payload contents
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
