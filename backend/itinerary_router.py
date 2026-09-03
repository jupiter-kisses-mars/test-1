from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models
import schemas
import security

router = APIRouter(prefix="/api/trips", tags=["Itinerary"])

def check_trip_access(trip_id: int, current_user: models.User, db: Session) -> models.Trip:
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    membership = db.query(models.TripMember).filter(
        models.TripMember.trip_id == trip_id,
        models.TripMember.user_id == current_user.id
    ).first()

    if not membership and trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this trip")
    return trip

@router.get("/{trip_id}/itinerary", response_model=List[schemas.ItineraryItemResponse])
def get_trip_itinerary(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    if current_user:
        check_trip_access(trip_id, current_user, db)
    items = db.query(models.ItineraryItem).filter(
        models.ItineraryItem.trip_id == trip_id
    ).order_by(
        models.ItineraryItem.day_number.asc(),
        models.ItineraryItem.order_index.asc(),
        models.ItineraryItem.id.asc()
    ).all()
    return items

@router.post("/{trip_id}/itinerary", response_model=schemas.ItineraryItemResponse, status_code=status.HTTP_201_CREATED)
def create_itinerary_item(
    trip_id: int,
    item_in: schemas.ItineraryItemCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    if current_user:
        check_trip_access(trip_id, current_user, db)

    new_item = models.ItineraryItem(
        trip_id=trip_id,
        day_number=item_in.day_number,
        activity_date=item_in.activity_date,
        title=item_in.title.strip(),
        start_time=item_in.start_time,
        end_time=item_in.end_time,
        location=item_in.location.strip() if item_in.location else None,
        notes=item_in.notes.strip() if item_in.notes else None,
        order_index=item_in.order_index or 0
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{trip_id}/itinerary/{item_id}", response_model=schemas.ItineraryItemResponse)
def update_itinerary_item(
    trip_id: int,
    item_id: int,
    item_update: schemas.ItineraryItemUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    if current_user:
        check_trip_access(trip_id, current_user, db)

    item = db.query(models.ItineraryItem).filter(
        models.ItineraryItem.id == item_id,
        models.ItineraryItem.trip_id == trip_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")

    for key, value in item_update.model_dump(exclude_unset=True).items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{trip_id}/itinerary/{item_id}", status_code=status.HTTP_200_OK)
def delete_itinerary_item(
    trip_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    if current_user:
        check_trip_access(trip_id, current_user, db)

    item = db.query(models.ItineraryItem).filter(
        models.ItineraryItem.id == item_id,
        models.ItineraryItem.trip_id == trip_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")

    db.delete(item)
    db.commit()
    return {"detail": "Itinerary item deleted successfully"}
