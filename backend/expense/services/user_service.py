from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from expense.models.user import User
from expense.schemas.user import UserCreate

def create_user(db: Session, user_in: UserCreate) -> User:
    user = User(full_name=user_in.name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

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
