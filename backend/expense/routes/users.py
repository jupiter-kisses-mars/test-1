from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from expense.database import get_db
from expense.schemas.user import UserCreate, UserResponse
from expense.services import user_service

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, user_in)

@router.get("", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return user_service.get_users(db)

@router.get("/{id}", response_model=UserResponse)
def get_user(id: int, db: Session = Depends(get_db)):
    return user_service.get_user_by_id(db, id)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_user(id: int, db: Session = Depends(get_db)):
    user_service.delete_user(db, id)
    return {"detail": f"User {id} deleted successfully"}
