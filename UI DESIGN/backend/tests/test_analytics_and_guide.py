import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_scenarios_list():
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3
    ids = [s["scenario_id"] for s in data]
    assert "vendor_pricing" in ids
    assert "job_offer" in ids
    assert "project_budget" in ids

def test_guide_query():
    res = client.post("/api/guide/query", json={"query": "How does constraint enforcement work?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "Hard Constraint Enforcement" in data["answer"] or "constraint" in data["answer"].lower()

def test_analytics_endpoint():
    # Create negotiation
    create_res = client.post("/api/negotiations", json={"scenario_id": "job_offer"})
    neg_id = create_res.json()["negotiation_id"]

    # Run turn
    client.post(f"/api/negotiations/{neg_id}/turn")

    # Get analytics
    analytics_res = client.get(f"/api/negotiations/{neg_id}/analytics")
    assert analytics_res.status_code == 200
    adata = analytics_res.json()
    assert adata["negotiation_id"] == neg_id
    assert "timeline" in adata
    assert "concession_totals" in adata
