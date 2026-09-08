import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_and_get_negotiation():
    response = client.post("/api/negotiations", json={"scenario_id": "vendor_pricing"})
    assert response.status_code == 201
    data = response.json()
    neg_id = data["negotiation_id"]
    assert data["status"] == "active"
    assert data["current_round"] == 0
    assert len(data["participating_agents"]) == 2

    # Get state
    get_res = client.get(f"/api/negotiations/{neg_id}")
    assert get_res.status_code == 200
    assert get_res.json()["negotiation_id"] == neg_id

def test_run_negotiation_turn_api():
    create_res = client.post("/api/negotiations", json={"scenario_id": "vendor_pricing"})
    neg_id = create_res.json()["negotiation_id"]

    turn_res = client.post(f"/api/negotiations/{neg_id}/turn")
    assert turn_res.status_code == 200
    turn_data = turn_res.json()
    assert "turn" in turn_data
    assert turn_data["turn"]["agent_id"] == "buyer"
    assert turn_data["state"]["current_round"] == 1
    assert turn_data["state"]["current_agent_turn"] == "vendor"
