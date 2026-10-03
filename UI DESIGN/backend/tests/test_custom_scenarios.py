import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_scenarios_contains_all_12_predefined():
    """Validates that GET /api/scenarios returns all 12 predefined scenarios."""
    res = client.get("/api/scenarios")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 12
    scenario_ids = [s["scenario_id"] for s in data]
    expected_ids = [
        "vendor_pricing", "job_offer", "project_budget", "real_estate",
        "car_purchase", "freelance_contract", "supplier_contract",
        "salary_benefits", "project_deadline", "rent_negotiation",
        "business_partnership", "service_contract"
    ]
    for exp_id in expected_ids:
        assert exp_id in scenario_ids

def test_get_single_predefined_scenario():
    """Validates fetching details for specific predefined scenarios."""
    res = client.get("/api/scenarios/real_estate")
    assert res.status_code == 200
    data = res.json()
    assert data["scenario_id"] == "real_estate"
    assert data["scenario_name"] == "Real Estate Price Negotiation"
    assert len(data["agents"]) == 2

def test_custom_scenario_validation_failure():
    """Validates that malformed custom scenarios are rejected with 422."""
    # 1. Less than 2 participants
    res1 = client.post("/api/custom-scenarios", json={
        "name": "Invalid Scenario",
        "description": "Short description",
        "participants": [
            {"name": "Solo Player", "role": "Buyer", "objective": "Win alone"}
        ]
    })
    assert res1.status_code == 422

    # 2. Min value greater than Max value
    res2 = client.post("/api/custom-scenarios", json={
        "name": "Invalid Constraints",
        "description": "Invalid min max test",
        "participants": [
            {"name": "Buyer", "role": "Buyer", "objective": "Buy cheap", "min_value": 50000, "max_value": 40000},
            {"name": "Seller", "role": "Seller", "objective": "Sell high"}
        ]
    })
    assert res2.status_code == 422

def test_custom_scenario_crud_lifecycle():
    """Validates full Create, Read, Update, Duplicate, Delete lifecycle for custom scenarios."""
    # 1. Create Custom Scenario
    create_payload = {
        "name": "Commercial Software Renewal",
        "category": "Services",
        "description": "Enterprise customer and SaaS vendor negotiate annual license renewal terms.",
        "max_rounds": 8,
        "mode": "simulation",
        "participants": [
            {
                "name": "Sarah Connor",
                "role": "Procurement Lead",
                "personality": "Risk-Averse",
                "objective": "Cap annual software license increase below 5%",
                "max_value": 120000
            },
            {
                "name": "Gordon Gekko",
                "role": "Account Executive",
                "persona": "Aggressive",
                "objective": "Maximize software renewal contract value",
                "min_value": 95000
            }
        ],
        "variables": [
            {"name": "Annual Fee", "type": "Currency", "starting_value": 110000},
            {"name": "Support Tier", "type": "Text", "starting_value": "24/7 Priority"}
        ]
    }

    res_create = client.post("/api/custom-scenarios", json=create_payload)
    assert res_create.status_code == 201
    created_scen = res_create.json()
    scen_id = created_scen["id"]
    assert created_scen["name"] == "Commercial Software Renewal"
    assert created_scen["is_custom"] is True
    assert len(created_scen["agents"]) == 2

    # 2. Retrieve Custom Scenario
    res_get = client.get(f"/api/custom-scenarios/{scen_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == scen_id

    # 3. Update Custom Scenario
    res_update = client.put(f"/api/custom-scenarios/{scen_id}", json={
        "name": "Commercial Software Renewal (Updated)",
        "max_rounds": 12
    })
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Commercial Software Renewal (Updated)"
    assert res_update.json()["max_rounds"] == 12

    # 4. Duplicate Custom Scenario
    res_dup = client.post(f"/api/custom-scenarios/{scen_id}/duplicate")
    assert res_dup.status_code == 201
    dup_scen = res_dup.json()
    dup_id = dup_scen["id"]
    assert dup_scen["name"] == "Commercial Software Renewal (Updated) (Copy)"

    # 5. Start Negotiation Session for Custom Scenario
    res_start = client.post(f"/api/custom-scenarios/{scen_id}/start?mode=simulation")
    assert res_start.status_code == 200
    start_data = res_start.json()
    assert start_data["success"] is True
    neg_id = start_data["negotiation_id"]
    assert start_data["state"]["max_rounds"] == 12

    # Run a negotiation turn for custom scenario
    turn_res = client.post(f"/api/negotiations/{neg_id}/turn")
    assert turn_res.status_code == 200
    turn_data = turn_res.json()
    assert turn_data["state"]["current_round"] >= 1

    # 6. Delete Custom Scenarios
    res_del1 = client.delete(f"/api/custom-scenarios/{scen_id}")
    assert res_del1.status_code == 200
    res_del2 = client.delete(f"/api/custom-scenarios/{dup_id}")
    assert res_del2.status_code == 200

    # Confirm deletion
    res_get_deleted = client.get(f"/api/custom-scenarios/{scen_id}")
    assert res_get_deleted.status_code == 404
