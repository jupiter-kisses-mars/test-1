import pytest
from fastapi.testclient import TestClient
from database import Base, engine
import models
import places_models
from main import app

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

client = TestClient(app)

def test_places_crud_and_summary():
    # 1. Create Place
    place_payload = {
        "name": "Cafe Chocolatti",
        "category": "Food",
        "location": "Candolim, Goa",
        "rating": 4.5,
        "status": "Visited",
        "notes": "Amazing hot chocolate and pastries!"
    }
    res = client.post("/api/places", json=place_payload)
    assert res.status_code == 201
    place_1 = res.json()
    assert place_1["name"] == "Cafe Chocolatti"
    assert place_1["category"] == "Food"
    assert place_1["status"] == "Visited"
    assert place_1["maps_url"] is not None
    assert place_1["visited_at"] is not None

    # 2. Create another place (Want to visit, Tourist, unrated)
    place_2_payload = {
        "name": "Aguada Fort",
        "category": "Tourist",
        "location": "Sinquerim, Goa",
        "status": "Want to Visit"
    }
    res2 = client.post("/api/places", json=place_2_payload)
    assert res2.status_code == 201
    place_2 = res2.json()
    assert place_2["rating"] is None
    assert place_2["status"] == "Want to Visit"

    # 3. List places with search & filter
    res_list = client.get("/api/places?search=Aguada")
    assert res_list.status_code == 200
    results = res_list.json()
    assert any(p["name"] == "Aguada Fort" for p in results)

    res_cat = client.get("/api/places?category=Food")
    assert res_cat.status_code == 200
    assert all(p["category"] == "Food" for p in res_cat.json())

    # 4. Patch status
    res_status = client.patch(f"/api/places/{place_2['id']}/status", json={"status": "Visited"})
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "Visited"
    assert res_status.json()["visited_at"] is not None

    # 5. Patch rating
    res_rating = client.patch(f"/api/places/{place_2['id']}/rating", json={"rating": 5.0})
    assert res_rating.status_code == 200
    assert res_rating.json()["rating"] == 5.0

    # 6. Summary endpoint
    res_sum = client.get("/api/places/summary")
    assert res_sum.status_code == 200
    summary = res_sum.json()
    assert summary["total_places"] >= 2
    assert "category_counts" in summary
    assert "Food" in summary["category_counts"]

    # 7. Update place (PUT)
    res_update = client.put(f"/api/places/{place_1['id']}", json={
        "name": "Cafe Chocolatti & Bakery",
        "category": "Food"
    })
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Cafe Chocolatti & Bakery"

    # 8. Delete place
    res_del = client.delete(f"/api/places/{place_1['id']}")
    assert res_del.status_code == 200

    res_get_deleted = client.get(f"/api/places/{place_1['id']}")
    assert res_get_deleted.status_code == 404
