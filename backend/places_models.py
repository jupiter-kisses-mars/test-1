from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # Food, Tourist, Shopping, Activities
    location = Column(String(255), nullable=False)
    rating = Column(Float, nullable=True)  # 1 to 5, nullable until visited
    status = Column(String(50), nullable=False, default="Want to Visit", index=True)  # 'Want to Visit' or 'Visited'
    notes = Column(Text, nullable=True)
    maps_url = Column(String(1000), nullable=True)
    visited_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
