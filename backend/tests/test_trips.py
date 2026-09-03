import pytest
from fastapi.testclient import TestClient
from database import Base, engine
import models
from main import app

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

client = TestClient(app)

def test_trip_creation_and_retrieval():
    # 1. Register User 1 with unique email
    email = "tripuser_unique@example.com"
    client.post("/api/auth/register", json={
        "full_name": "Test User",
        "email": email,
        "password": "password123",
        "confirm_password": "password123"
    })

    # 2. Login User 1
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "password123"
    }).json()
    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Trip
    trip_data = {
        "title": "Goa Beach Trip",
        "destination": "Goa",
        "start_date": "2026-10-01",
        "end_date": "2026-10-05",
        "description": "Fun weekend",
        "cover_image": "beach"
    }
    create_res = client.post("/api/trips", json=trip_data, headers=headers)
    assert create_res.status_code == 201
    created_trip = create_res.json()
    assert created_trip["title"] == "Goa Beach Trip"
    assert len(created_trip["members"]) == 1

    # 4. Get User Trips
    get_res = client.get("/api/trips", headers=headers)
    assert get_res.status_code == 200
    trips = get_res.json()
    assert len(trips) >= 1
    assert trips[0]["destination"] == "Goa"
