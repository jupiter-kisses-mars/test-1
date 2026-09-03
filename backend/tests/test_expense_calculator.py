from decimal import Decimal
from expense.utils.money import calculate_equal_split, round_money

def test_money_equal_split_rounding():
    # Test 100 / 3 -> 33.34, 33.33, 33.33
    shares = calculate_equal_split(Decimal("100.00"), 3)
    assert len(shares) == 3
    assert shares == [Decimal("33.34"), Decimal("33.33"), Decimal("33.33")]
    assert sum(shares) == Decimal("100.00")

    # Test 2000 / 4 -> 500.00 each
    shares2 = calculate_equal_split(Decimal("2000.00"), 4)
    assert len(shares2) == 4
    assert all(s == Decimal("500.00") for s in shares2)
    assert sum(shares2) == Decimal("2000.00")

    # Test 10 / 3 -> 3.34, 3.33, 3.33
    shares3 = calculate_equal_split(Decimal("10.00"), 3)
    assert shares3 == [Decimal("3.34"), Decimal("3.33"), Decimal("3.33")]
    assert sum(shares3) == Decimal("10.00")


def test_user_crud(client):
    # Create user
    res = client.post("/api/users", json={"name": "Vishal"})
    assert res.status_code == 201
    user1 = res.json()
    assert user1["name"] == "Vishal"
    assert "id" in user1

    # List users
    res = client.get("/api/users")
    assert res.status_code == 200
    assert len(res.json()) == 1

    # Get user by id
    res = client.get(f"/api/users/{user1['id']}")
    assert res.status_code == 200
    assert res.json()["name"] == "Vishal"

    # Delete user
    res = client.delete(f"/api/users/{user1['id']}")
    assert res.status_code == 200

    # Get deleted user -> 404
    res = client.get(f"/api/users/{user1['id']}")
    assert res.status_code == 404


def test_expense_preview_calculate(client):
    # Create users
    u1 = client.post("/api/users", json={"name": "Vishal"}).json()
    u2 = client.post("/api/users", json={"name": "Phoobesh"}).json()

    # Equal split preview
    preview_req = {
        "amount": 100.00,
        "paid_by": u1["id"],
        "split_type": "equal",
        "participants": [
            {"user_id": u1["id"]},
            {"user_id": u2["id"]}
        ]
    }
    res = client.post("/api/expenses/calculate", json=preview_req)
    assert res.status_code == 200
    data = res.json()
    assert Decimal(str(data["amount"])) == Decimal("100.00")
    assert len(data["shares"]) == 2
    assert Decimal(str(data["shares"][0]["share_amount"])) == Decimal("50.00")
    assert Decimal(str(data["shares"][1]["share_amount"])) == Decimal("50.00")


def test_expense_crud_and_equal_split(client):
    # Setup users
    u1 = client.post("/api/users", json={"name": "Vishal"}).json()
    u2 = client.post("/api/users", json={"name": "Phoobesh"}).json()
    u3 = client.post("/api/users", json={"name": "Abi"}).json()
    u4 = client.post("/api/users", json={"name": "SK"}).json()

    # Create equal split expense: 2000 paid by Vishal
    expense_req = {
        "description": "Team Dinner",
        "amount": 2000.00,
        "paid_by": u1["id"],
        "split_type": "equal",
        "participants": [
            {"user_id": u1["id"]},
            {"user_id": u2["id"]},
            {"user_id": u3["id"]},
            {"user_id": u4["id"]}
        ]
    }
    res = client.post("/api/expenses", json=expense_req)
    assert res.status_code == 201
    exp = res.json()
    assert exp["description"] == "Team Dinner"
    assert Decimal(str(exp["amount"])) == Decimal("2000.00")
    assert exp["paid_by"] == u1["id"]
    assert exp["payer_name"] == "Vishal"
    assert len(exp["participants"]) == 4
    for p in exp["participants"]:
        assert Decimal(str(p["share_amount"])) == Decimal("500.00")

    # Get expense by ID
    res = client.get(f"/api/expenses/{exp['id']}")
    assert res.status_code == 200
    assert res.json()["id"] == exp["id"]

    # List expenses
    res = client.get("/api/expenses")
    assert res.status_code == 200
    assert len(res.json()) == 1

    # Update expense
    update_req = {
        "description": "Team Dinner & Drinks",
        "amount": 2400.00
    }
    res = client.put(f"/api/expenses/{exp['id']}", json=update_req)
    assert res.status_code == 200
    updated_exp = res.json()
    assert updated_exp["description"] == "Team Dinner & Drinks"
    assert Decimal(str(updated_exp["amount"])) == Decimal("2400.00")
    for p in updated_exp["participants"]:
        assert Decimal(str(p["share_amount"])) == Decimal("600.00")

    # Delete expense
    res = client.delete(f"/api/expenses/{exp['id']}")
    assert res.status_code == 200

    res = client.get(f"/api/expenses/{exp['id']}")
    assert res.status_code == 404


def test_custom_split_and_validation(client):
    u1 = client.post("/api/users", json={"name": "Alice"}).json()
    u2 = client.post("/api/users", json={"name": "Bob"}).json()

    # Valid custom split: 100 paid by Alice -> Alice 60, Bob 40
    custom_req = {
        "description": "Groceries",
        "amount": 100.00,
        "paid_by": u1["id"],
        "split_type": "custom",
        "participants": [
            {"user_id": u1["id"], "share_amount": 60.00},
            {"user_id": u2["id"], "share_amount": 40.00}
        ]
    }
    res = client.post("/api/expenses", json=custom_req)
    assert res.status_code == 201
    exp = res.json()
    shares = {p["user_id"]: Decimal(str(p["share_amount"])) for p in exp["participants"]}
    assert shares[u1["id"]] == Decimal("60.00")
    assert shares[u2["id"]] == Decimal("40.00")

    # Invalid custom split: sum(shares) != amount (60 + 50 = 110 != 100) -> 400 Bad Request
    invalid_custom_req = {
        "description": "Groceries",
        "amount": 100.00,
        "paid_by": u1["id"],
        "split_type": "custom",
        "participants": [
            {"user_id": u1["id"], "share_amount": 60.00},
            {"user_id": u2["id"], "share_amount": 50.00}
        ]
    }
    res = client.post("/api/expenses", json=invalid_custom_req)
    assert res.status_code == 400


def test_invalid_inputs(client):
    u1 = client.post("/api/users", json={"name": "User 1"}).json()

    # 1. Negative / Zero amount
    res = client.post("/api/expenses", json={
        "description": "Invalid",
        "amount": -50.00,
        "paid_by": u1["id"],
        "split_type": "equal",
        "participants": [{"user_id": u1["id"]}]
    })
    assert res.status_code in (400, 422)

    # 2. Duplicate participants
    res = client.post("/api/expenses", json={
        "description": "Dup",
        "amount": 100.00,
        "paid_by": u1["id"],
        "split_type": "equal",
        "participants": [{"user_id": u1["id"]}, {"user_id": u1["id"]}]
    })
    assert res.status_code in (400, 422)

    # 3. Unknown user ID in participants
    res = client.post("/api/expenses", json={
        "description": "Unknown User",
        "amount": 100.00,
        "paid_by": u1["id"],
        "split_type": "equal",
        "participants": [{"user_id": u1["id"]}, {"user_id": 9999}]
    })
    assert res.status_code in (400, 404)

    # 4. Empty participants list
    res = client.post("/api/expenses", json={
        "description": "No Participants",
        "amount": 100.00,
        "paid_by": u1["id"],
        "split_type": "equal",
        "participants": []
    })
    assert res.status_code in (400, 422)


def test_balances_and_settlements_flow(client):
    u1 = client.post("/api/users", json={"name": "Vishal"}).json()
    u2 = client.post("/api/users", json={"name": "Phoobesh"}).json()
    u3 = client.post("/api/users", json={"name": "Abi"}).json()
    u4 = client.post("/api/users", json={"name": "SK"}).json()

    exp_req = {
        "description": "Goa Trip Resort",
        "amount": 2000.00,
        "paid_by": u1["id"],
        "split_type": "equal",
        "participants": [
            {"user_id": u1["id"]},
            {"user_id": u2["id"]},
            {"user_id": u3["id"]},
            {"user_id": u4["id"]}
        ]
    }
    res = client.post("/api/expenses", json=exp_req)
    assert res.status_code == 201

    # Check balances endpoint
    res = client.get("/api/balances")
    assert res.status_code == 200
    balances_data = {b["user_name"]: Decimal(str(b["balance"])) for b in res.json()["balances"]}

    assert balances_data["Vishal"] == Decimal("1500.00")
    assert balances_data["Phoobesh"] == Decimal("-500.00")
    assert balances_data["Abi"] == Decimal("-500.00")
    assert balances_data["SK"] == Decimal("-500.00")

    # Check settlements endpoint
    res = client.get("/api/balances/settlements")
    assert res.status_code == 200
    settlements = res.json()["settlements"]
    assert len(settlements) == 3

    for s in settlements:
        assert s["to_user_name"] == "Vishal"
        assert Decimal(str(s["amount"])) == Decimal("500.00")
        assert s["from_user_name"] in ["Phoobesh", "Abi", "SK"]

    # Check dashboard endpoint
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    dash = res.json()
    assert dash["total_users"] == 4
    assert dash["total_expenses_count"] == 1
    assert Decimal(str(dash["total_expenses_amount"])) == Decimal("2000.00")
    assert len(dash["recent_expenses"]) == 1

    # Check health endpoint
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
