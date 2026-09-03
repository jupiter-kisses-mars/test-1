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

    model_config = ConfigDict(from_attributes=True)

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

# Itinerary Item Schemas
class ItineraryItemBase(BaseModel):
    day_number: int = 1
    activity_date: Optional[str] = None
    title: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    order_index: Optional[int] = 0

class ItineraryItemCreate(ItineraryItemBase):
    pass

class ItineraryItemUpdate(BaseModel):
    day_number: Optional[int] = None
    activity_date: Optional[str] = None
    title: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    order_index: Optional[int] = None

class ItineraryItemResponse(ItineraryItemBase):
    id: int
    trip_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Chat Schemas
class ChatSender(BaseModel):
    id: int
    full_name: str
    email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    trip_id: int
    sender_id: int
    message: str
    created_at: datetime
    sender: Optional[ChatSender] = None

    model_config = ConfigDict(from_attributes=True)



