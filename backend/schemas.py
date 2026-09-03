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

# Trip Member Schema
class TripMemberUser(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: str
    status: str = "accepted"

    model_config = ConfigDict(from_attributes=True)

class TripMemberStatusUpdate(BaseModel):
    status: str # 'accepted' or 'rejected'

# Trip Base Schema
class TripBase(BaseModel):
    title: str
    destination: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    cover_image: Optional[str] = "default"

# Schema for creating a trip
class TripCreate(TripBase):
    invite_emails: Optional[list[EmailStr]] = []

# Schema for updating a trip
class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None

# Schema for adding member
class AddMemberSchema(BaseModel):
    email: EmailStr

# Schema for Trip Response
class TripResponse(TripBase):
    id: int
    owner_id: int
    created_at: datetime
    members: list[TripMemberUser] = []

    model_config = ConfigDict(from_attributes=True)

