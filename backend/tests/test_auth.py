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

def test_register_login_me_flow():
    # 1. Test Password Mismatch Validation
    mismatch_payload = {
        "full_name": "Phoobesh User",
        "email": "phoobesh@example.com",
        "password": "securepassword123",
        "confirm_password": "differentpassword"
    }
    mismatch_res = client.post("/api/auth/register", json=mismatch_payload)
    assert mismatch_res.status_code == 422  # Validation Error

    import uuid
    test_email = f"phoobesh_{uuid.uuid4().hex[:8]}@example.com"
    user_payload = {
        "full_name": "Phoobesh User",
        "email": test_email,
        "password": "securepassword123",
        "confirm_password": "securepassword123"
    }
    response = client.post("/api/auth/register", json=user_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_payload["email"]
    assert data["full_name"] == user_payload["full_name"]
    assert "id" in data

    # 3. Test Login
    login_payload = {
        "email": test_email,
        "password": "securepassword123"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    token = data["access_token"]

    # 4. Test Protected /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    user_info = response.json()
    assert user_info["email"] == user_payload["email"]
    assert user_info["full_name"] == user_payload["full_name"]
