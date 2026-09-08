import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_agents():
    response = client.get("/api/agents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

def test_create_agent():
    payload = {
        "id": "test_agent_1",
        "name": "Test Procurement Manager",
        "role": "buyer",
        "persona": "Analytical & cautious",
        "goals": ["Minimize expense"],
        "constraints": {"maximum_price": 50000},
        "negotiation_objectives": ["Target 45000"]
    }
    response = client.post("/api/agents", json=payload)
    assert response.status_code in [201, 400]
    if response.status_code == 201:
        data = response.json()
        assert data["id"] == "test_agent_1"
        assert data["name"] == "Test Procurement Manager"

def test_get_agent():
    response = client.get("/api/agents/buyer")
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "buyer"
