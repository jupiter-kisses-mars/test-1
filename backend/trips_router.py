from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import security
from typing import List

router = APIRouter(prefix="/api/trips", tags=["Trips"])

def format_trip_response(trip: models.Trip, db: Session) -> dict:
    member_records = db.query(models.TripMember).filter(models.TripMember.trip_id == trip.id).all()
    members_data = []
    for tm in member_records:
        user = db.query(models.User).filter(models.User.id == tm.user_id).first()
        if user:
            members_data.append({
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "role": tm.role,
                "status": getattr(tm, "status", "accepted") or "accepted"
            })

    return {
        "id": trip.id,
        "title": trip.title,
        "destination": trip.destination,
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "description": trip.description,
        "cover_image": trip.cover_image or "default",
        "owner_id": trip.owner_id,
        "created_at": trip.created_at,
        "members": members_data
    }

@router.get("", response_model=List[schemas.TripResponse])
def get_user_trips(current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    user_memberships = db.query(models.TripMember).filter(models.TripMember.user_id == current_user.id).all()
    trip_ids = [m.trip_id for m in user_memberships]
    
    trips = db.query(models.Trip).filter((models.Trip.id.in_(trip_ids)) | (models.Trip.owner_id == current_user.id)).all()
    
    return [format_trip_response(t, db) for t in trips]

@router.post("", response_model=schemas.TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(trip_data: schemas.TripCreate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    new_trip = models.Trip(
        title=trip_data.title,
        destination=trip_data.destination,
        start_date=trip_data.start_date,
        end_date=trip_data.end_date,
        description=trip_data.description,
        cover_image=trip_data.cover_image or "default",
        owner_id=current_user.id
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)

    owner_membership = models.TripMember(
        trip_id=new_trip.id,
        user_id=current_user.id,
        role="owner",
        status="accepted"
    )
    db.add(owner_membership)

    if trip_data.invite_emails:
        for email in trip_data.invite_emails:
            invited_user = db.query(models.User).filter(models.User.email == email).first()
            if invited_user and invited_user.id != current_user.id:
                member_entry = models.TripMember(
                    trip_id=new_trip.id,
                    user_id=invited_user.id,
                    role="member",
                    status="pending"
                )
                db.add(member_entry)

    db.commit()
    return format_trip_response(new_trip, db)

@router.get("/{trip_id}", response_model=schemas.TripResponse)
def get_trip(trip_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    membership = db.query(models.TripMember).filter(
        models.TripMember.trip_id == trip_id,
        models.TripMember.user_id == current_user.id
    ).first()

    if not membership and trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have access to this trip")

    return format_trip_response(trip, db)

@router.put("/{trip_id}", response_model=schemas.TripResponse)
def update_trip(trip_id: int, trip_update: schemas.TripUpdate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only trip owner can edit trip details")

    for key, value in trip_update.model_dump(exclude_unset=True).items():
        setattr(trip, key, value)

    db.commit()
    db.refresh(trip)
    return format_trip_response(trip, db)

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only trip owner can delete this trip")

    db.query(models.TripMember).filter(models.TripMember.trip_id == trip_id).delete()
    db.delete(trip)
    db.commit()
    return None

@router.post("/{trip_id}/members", response_model=schemas.TripResponse)
def add_trip_member(trip_id: int, member_data: schemas.AddMemberSchema, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    user_to_add = db.query(models.User).filter(models.User.email == member_data.email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User with this email was not found. Ask them to register on TripMate first!")

    existing_membership = db.query(models.TripMember).filter(
        models.TripMember.trip_id == trip_id,
        models.TripMember.user_id == user_to_add.id
    ).first()

    if existing_membership:
        raise HTTPException(status_code=400, detail="User is already invited or a member of this trip")

    new_membership = models.TripMember(
        trip_id=trip_id,
        user_id=user_to_add.id,
        role="member",
        status="pending"
    )
    db.add(new_membership)
    db.commit()

    return format_trip_response(trip, db)

@router.put("/{trip_id}/invitation", response_model=schemas.TripResponse)
def respond_to_invitation(trip_id: int, status_update: schemas.TripMemberStatusUpdate, current_user: models.User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    membership = db.query(models.TripMember).filter(
        models.TripMember.trip_id == trip_id,
        models.TripMember.user_id == current_user.id
    ).first()

    if not membership:
        raise HTTPException(status_code=404, detail="Invitation not found for this trip")

    if status_update.status not in ["accepted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'accepted' or 'rejected'")

    if status_update.status == "rejected":
        db.delete(membership)
    else:
        membership.status = "accepted"
    
    db.commit()
    
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    return format_trip_response(trip, db)
