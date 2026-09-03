from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from database import get_db
import models
import security
import places_schemas
import places_service

router = APIRouter(prefix="/api/places", tags=["Places & Suggestions"])

@router.get("/summary", response_model=places_schemas.PlacesSummaryResponse)
def get_places_summary(
    trip_id: Optional[int] = Query(None, description="Optional trip ID to filter summary"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    return places_service.get_places_summary(db, trip_id=trip_id)

@router.post("", response_model=places_schemas.PlaceResponse, status_code=status.HTTP_201_CREATED)
def create_place(
    place_in: places_schemas.PlaceCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    return places_service.create_place(db, place_in, user_id=user_id)

@router.get("", response_model=List[places_schemas.PlaceResponse])
def list_places(
    search: Optional[str] = Query(None, description="Search place name, location, or notes"),
    category: Optional[str] = Query(None, description="Filter by category (Food, Tourist, Shopping, Activities)"),
    status: Optional[str] = Query(None, description="Filter by status (Want to Visit, Visited)"),
    trip_id: Optional[int] = Query(None, description="Filter by trip ID"),
    sort_by: Optional[str] = Query("recently_added", description="Sort by: recently_added, name, rating"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    return places_service.get_places(
        db,
        search=search,
        category=category,
        place_status=status,
        trip_id=trip_id,
        sort_by=sort_by
    )

@router.get("/{id}", response_model=places_schemas.PlaceResponse)
def get_place(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    return places_service.get_place_by_id(db, id)

@router.put("/{id}", response_model=places_schemas.PlaceResponse)
def update_place(
    id: int,
    place_update: places_schemas.PlaceUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    return places_service.update_place(db, id, place_update)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_place(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    places_service.delete_place(db, id)
    return {"detail": f"Place {id} deleted successfully"}

@router.patch("/{id}/status", response_model=places_schemas.PlaceResponse)
def patch_place_status(
    id: int,
    status_in: places_schemas.PlaceStatusUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    return places_service.update_place_status(db, id, status_in.status)

@router.patch("/{id}/rating", response_model=places_schemas.PlaceResponse)
def patch_place_rating(
    id: int,
    rating_in: places_schemas.PlaceRatingUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    return places_service.update_place_rating(db, id, rating_in.rating)
