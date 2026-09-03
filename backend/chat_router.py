from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from database import get_db
import models
import schemas
import security

router = APIRouter(prefix="/api/trips", tags=["Chat"])

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

@router.get("/{trip_id}/chat", response_model=List[schemas.ChatMessageResponse])
def get_trip_chat_messages(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    if current_user:
        check_trip_access(trip_id, current_user, db)

    messages = db.query(models.ChatMessage).options(
        joinedload(models.ChatMessage.sender)
    ).filter(
        models.ChatMessage.trip_id == trip_id
    ).order_by(
        models.ChatMessage.id.asc()
    ).all()

    return messages

@router.post("/{trip_id}/chat", response_model=schemas.ChatMessageResponse, status_code=status.HTTP_201_CREATED)
def post_trip_chat_message(
    trip_id: int,
    msg_in: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(security.get_current_user_optional)
):
    if not msg_in.message or not msg_in.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    sender = current_user
    if not sender:
        # Fallback to first user in database if unauthenticated in dev
        sender = db.query(models.User).order_by(models.User.id.asc()).first()
        if not sender:
            raise HTTPException(status_code=401, detail="User authentication required to send messages")
    else:
        check_trip_access(trip_id, sender, db)

    new_msg = models.ChatMessage(
        trip_id=trip_id,
        sender_id=sender.id,
        message=msg_in.message.strip()
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)

    # Load sender relationship
    new_msg = db.query(models.ChatMessage).options(
        joinedload(models.ChatMessage.sender)
    ).filter(
        models.ChatMessage.id == new_msg.id
    ).first()

    return new_msg
