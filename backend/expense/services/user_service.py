import uuid
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from expense.models.user import User
from expense.schemas.user import UserCreate

def create_user(db: Session, user_in: UserCreate) -> User:
    email = user_in.email
    if not email:
        clean_name = "".join(c for c in user_in.name.lower() if c.isalnum()) or "user"
        email = f"{clean_name}_{uuid.uuid4().hex[:6]}@local.user"

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing

    try:
        user = User(full_name=user_in.name, email=email)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        existing_by_name = db.query(User).filter(User.full_name == user_in.name).first()
        if existing_by_name:
            return existing_by_name
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with name '{user_in.name}' already exists or invalid data"
        )



def get_user_by_id(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return user

def get_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.id.asc()).all()

def delete_user(db: Session, user_id: int) -> None:
    user = get_user_by_id(db, user_id)
    db.delete(user)
    db.commit()
