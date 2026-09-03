from typing import List, Optional, Dict
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException, status
import places_models
import places_schemas

def create_place(db: Session, place_in: places_schemas.PlaceCreate, user_id: Optional[int] = None) -> places_models.Place:
    visited_at = datetime.utcnow() if place_in.status == "Visited" else None
    
    # Auto-generate Google Maps search URL if not provided
    maps_url = place_in.maps_url
    if not maps_url and place_in.name and place_in.location:
        query = f"{place_in.name}, {place_in.location}".replace(" ", "+")
        maps_url = f"https://www.google.com/maps/search/?api=1&query={query}"

    db_place = places_models.Place(
        name=place_in.name.strip(),
        category=place_in.category,
        location=place_in.location.strip(),
        rating=place_in.rating,
        status=place_in.status,
        notes=place_in.notes,
        maps_url=maps_url,
        trip_id=place_in.trip_id,
        user_id=user_id,
        visited_at=visited_at
    )
    db.add(db_place)
    db.commit()
    db.refresh(db_place)
    return db_place

def get_places(
    db: Session,
    search: Optional[str] = None,
    category: Optional[str] = None,
    place_status: Optional[str] = None,
    trip_id: Optional[int] = None,
    sort_by: Optional[str] = "recently_added"  # 'recently_added', 'name', 'rating'
) -> List[places_models.Place]:
    query = db.query(places_models.Place)

    if trip_id is not None:
        query = query.filter(places_models.Place.trip_id == trip_id)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                places_models.Place.name.ilike(search_pattern),
                places_models.Place.location.ilike(search_pattern),
                places_models.Place.notes.ilike(search_pattern)
            )
        )

    if category and category.lower() != "all":
        query = query.filter(places_models.Place.category.ilike(category.strip()))

    if place_status and place_status.lower() != "all":
        # Handle 'visited', 'want to visit', 'want_to_visit'
        clean_status = place_status.strip().replace("_", " ")
        if clean_status.lower() == "visited":
            query = query.filter(places_models.Place.status == "Visited")
        elif "want" in clean_status.lower():
            query = query.filter(places_models.Place.status == "Want to Visit")
        else:
            query = query.filter(places_models.Place.status.ilike(clean_status))

    # Sorting
    if sort_by == "name":
        query = query.order_by(places_models.Place.name.asc())
    elif sort_by == "rating":
        # Null ratings last, highest ratings first
        query = query.order_by(places_models.Place.rating.desc().nullslast(), places_models.Place.created_at.desc())
    else:  # default 'recently_added'
        query = query.order_by(places_models.Place.created_at.desc())

    return query.all()

def get_place_by_id(db: Session, place_id: int) -> places_models.Place:
    place = db.query(places_models.Place).filter(places_models.Place.id == place_id).first()
    if not place:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Place with ID {place_id} not found"
        )
    return place

def update_place(db: Session, place_id: int, place_update: places_schemas.PlaceUpdate) -> places_models.Place:
    place = get_place_by_id(db, place_id)

    update_data = place_update.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"]:
        if update_data["status"] == "Visited" and place.status != "Visited":
            place.visited_at = datetime.utcnow()
        elif update_data["status"] == "Want to Visit":
            place.visited_at = None

    for field, val in update_data.items():
        setattr(place, field, val)

    # Regenerate maps_url if name or location updated and maps_url is empty
    if not place.maps_url and place.name and place.location:
        query = f"{place.name}, {place.location}".replace(" ", "+")
        place.maps_url = f"https://www.google.com/maps/search/?api=1&query={query}"

    place.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(place)
    return place

def update_place_status(db: Session, place_id: int, new_status: str) -> places_models.Place:
    place = get_place_by_id(db, place_id)
    if new_status == "Visited":
        place.status = "Visited"
        if not place.visited_at:
            place.visited_at = datetime.utcnow()
    else:
        place.status = "Want to Visit"
        place.visited_at = None

    place.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(place)
    return place

def update_place_rating(db: Session, place_id: int, rating: Optional[float]) -> places_models.Place:
    place = get_place_by_id(db, place_id)
    place.rating = rating
    place.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(place)
    return place

def delete_place(db: Session, place_id: int) -> bool:
    place = get_place_by_id(db, place_id)
    db.delete(place)
    db.commit()
    return True

def get_places_summary(db: Session, trip_id: Optional[int] = None) -> places_schemas.PlacesSummaryResponse:
    query = db.query(places_models.Place)
    if trip_id is not None:
        query = query.filter(places_models.Place.trip_id == trip_id)

    all_places = query.all()

    total_places = len(all_places)
    total_visited = sum(1 for p in all_places if p.status == "Visited")
    total_want_to_visit = sum(1 for p in all_places if p.status == "Want to Visit")

    rated_places = [p.rating for p in all_places if p.rating is not None]
    average_rating = round(sum(rated_places) / len(rated_places), 1) if rated_places else 0.0

    category_counts: Dict[str, int] = {
        "Food": 0,
        "Tourist": 0,
        "Shopping": 0,
        "Activities": 0
    }
    for p in all_places:
        for standard_cat in category_counts:
            if p.category and p.category.lower() == standard_cat.lower():
                category_counts[standard_cat] += 1
                break

    return places_schemas.PlacesSummaryResponse(
        total_places=total_places,
        total_visited=total_visited,
        total_want_to_visit=total_want_to_visit,
        average_rating=average_rating,
        category_counts=category_counts
    )
