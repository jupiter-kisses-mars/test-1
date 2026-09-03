from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from typing import Optional, List, Dict

VALID_CATEGORIES = ["Food", "Tourist", "Shopping", "Activities"]
VALID_STATUSES = ["Want to Visit", "Visited"]

class PlaceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str
    location: str = Field(..., min_length=1, max_length=255)
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    status: Optional[str] = "Want to Visit"
    notes: Optional[str] = None
    maps_url: Optional[str] = None
    trip_id: Optional[int] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        # Match case-insensitively to standard categories
        for cat in VALID_CATEGORIES:
            if v.strip().lower() == cat.lower():
                return cat
        raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> str:
        if v is None:
            return "Want to Visit"
        for st in VALID_STATUSES:
            if v.strip().lower() == st.lower():
                return st
        raise ValueError(f"Status must be one of: {', '.join(VALID_STATUSES)}")

class PlaceCreate(PlaceBase):
    pass

class PlaceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)
    status: Optional[str] = None
    notes: Optional[str] = None
    maps_url: Optional[str] = None
    trip_id: Optional[int] = None

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        for cat in VALID_CATEGORIES:
            if v.strip().lower() == cat.lower():
                return cat
        raise ValueError(f"Category must be one of: {', '.join(VALID_CATEGORIES)}")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        for st in VALID_STATUSES:
            if v.strip().lower() == st.lower():
                return st
        raise ValueError(f"Status must be one of: {', '.join(VALID_STATUSES)}")

class PlaceStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        for st in VALID_STATUSES:
            if v.strip().lower() == st.lower():
                return st
        raise ValueError(f"Status must be one of: {', '.join(VALID_STATUSES)}")

class PlaceRatingUpdate(BaseModel):
    rating: Optional[float] = Field(None, ge=1.0, le=5.0)

class PlaceResponse(PlaceBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    visited_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CategoryCount(BaseModel):
    category: str
    count: int

class PlacesSummaryResponse(BaseModel):
    total_places: int
    total_visited: int
    total_want_to_visit: int
    average_rating: float
    category_counts: Dict[str, int]
