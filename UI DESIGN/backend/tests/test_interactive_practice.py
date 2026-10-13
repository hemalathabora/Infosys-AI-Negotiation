import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.services.orchestrator import NegotiationOrchestrator
from app.services.negotiation_service import DEFAULT_SCENARIOS, create_negotiation_session
from app.services.practice_service import (
    parse_natural_language_offer,
    calculate_negotiation_scorecard,
    generate_strategy_coaching,
    get_difficulty_settings
)

client = TestClient(app)

# ============================================================
# 1. NATURAL LANGUAGE OFFER PARSING TESTS
# ============================================================

def test_parse_natural_language_multi_variable():
    text = "I can offer $46,500 if you provide 20 days delivery and 24 months warranty."
    success, parsed, conf, msg = parse_natural_language_offer(text, "vendor_pricing")
    assert success is True
    assert parsed.get("price") == 46500.0
    assert parsed.get("delivery_days") == 20
    assert parsed.get("warranty_months") == 24
    assert conf > 0.7

def test_parse_natural_language_job_offer():
    text = "I am requesting a base salary of 105000 with 3 remote days and 20 days vacation."
    success, parsed, conf, msg = parse_natural_language_offer(text, "job_offer")
    assert success is True
    assert parsed.get("salary") == 105000.0
    assert parsed.get("remote_days") == 3
    assert parsed.get("vacation_days") == 20

def test_parse_message_endpoint():
    res = client.post("/api/negotiations/any-id/parse-message", json={
        "message": "Let us settle at 45000 with 15 days delivery and 12 months support",
        "scenario_id": "vendor_pricing"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["parsed_offer"]["price"] == 45000.0
    assert data["parsed_offer"]["delivery_days"] == 15
    assert data["parsed_offer"]["support_months"] == 12

# ============================================================
# 2. DIFFICULTY & AI PERSONALITY PRACTICE SESSIONS
# ============================================================

@pytest.mark.parametrize("diff", ["Beginner", "Intermediate", "Advanced", "Expert"])
def test_create_session_with_difficulty(diff):
    res = client.post("/api/negotiations", json={
        "scenario_id": "vendor_pricing",
        "mode": "practice",
        "human_role": "buyer",
        "difficulty": diff,
        "ai_personality": "Aggressive"
    })
    assert res.status_code == 201
    data = res.json()
    assert data["difficulty"] == diff
    ai_agent = next(a for a in data["participating_agents"] if a["id"] != "buyer")
    assert ai_agent["personality"] == "Aggressive"
    assert "variables" in data
    assert "live_metrics" in data

@pytest.mark.parametrize("persona", ["Aggressive", "Collaborative", "Risk-Averse"])
def test_practice_ai_personality_adaptation(persona):
    res = client.post("/api/negotiations", json={
        "scenario_id": "vendor_pricing",
        "mode": "practice",
        "human_role": "buyer",
        "ai_personality": persona
    })
    assert res.status_code == 201
    session_id = res.json()["negotiation_id"]

    # Submit human turn
    turn_res = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
        "offer": {"price": 43500, "delivery_days": 20},
        "message": "Our firm proposal."
    })
    assert turn_res.status_code == 200
    state = turn_res.json()
    ai_turn = state["history"][1]
    assert ai_turn["decision"] in ["counter", "accept", "reject"]
    assert "tradeoff_data" in ai_turn
    assert "utility_data" in ai_turn

# ============================================================
# 3. PRACTICE MODE MULTI-VARIABLE TURN FLOW
# ============================================================

def test_multi_variable_practice_turn_flow():
    res = client.post("/api/negotiations", json={
        "scenario_id": "vendor_pricing",
        "mode": "practice",
        "human_role": "buyer"
    })
    session_id = res.json()["negotiation_id"]

    # Submit package offer
    turn_res = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
        "offer": {
            "price": 45000,
            "delivery_days": 25,
            "warranty_months": 18,
            "support_months": 12
        },
        "message": "Offering flexibility on delivery for higher warranty."
    })
    assert turn_res.status_code == 200
    state = turn_res.json()
    assert len(state["history"]) == 2

    human_turn = state["history"][0]
    assert human_turn["strategy_feedback"] is not None
    assert "tradeoff_data" in human_turn

    ai_turn = state["history"][1]
    assert isinstance(ai_turn["proposed_offer"], dict)
    assert "price" in ai_turn["proposed_offer"]

# ============================================================
# 4. HINT & METRICS ENDPOINTS
# ============================================================

def test_hint_endpoint():
    res = client.post("/api/negotiations", json={
        "scenario_id": "vendor_pricing",
        "mode": "practice",
        "human_role": "buyer"
    })
    session_id = res.json()["negotiation_id"]

    hint_res = client.post(f"/api/negotiations/{session_id}/hint")
    assert hint_res.status_code == 200
    hint_data = hint_res.json()
    assert "hint" in hint_data
    assert "tactical_advice" in hint_data
    assert "opponent_flexibility" in hint_data

def test_metrics_endpoint():
    res = client.post("/api/negotiations", json={
        "scenario_id": "vendor_pricing",
        "mode": "practice",
        "human_role": "buyer"
    })
    session_id = res.json()["negotiation_id"]

    metrics_res = client.get(f"/api/negotiations/{session_id}/metrics")
    assert metrics_res.status_code == 200
    metrics_data = metrics_res.json()
    assert "human_utility_pct" in metrics_data
    assert "ai_utility_pct" in metrics_data
    assert "ai_stance" in metrics_data

# ============================================================
# 5. SCORECARD & MANUAL END ENDPOINT
# ============================================================

def test_manual_end_session_and_scorecard():
    res = client.post("/api/negotiations", json={
        "scenario_id": "vendor_pricing",
        "mode": "practice",
        "human_role": "buyer"
    })
    session_id = res.json()["negotiation_id"]

    # Submit an offer
    client.post(f"/api/negotiations/{session_id}/practice-turn", json={
        "offer": {"price": 46000, "delivery_days": 20},
        "message": "Let us reach agreement."
    })

    # End negotiation
    end_res = client.post(f"/api/negotiations/{session_id}/end?outcome=agreement")
    assert end_res.status_code == 200
    scorecard = end_res.json()
    assert "overall_score" in scorecard
    assert 0 <= scorecard["overall_score"] <= 100
    assert scorecard["outcome"] == "AGREEMENT"
    assert "coaching_summary" in scorecard

# ============================================================
# 6. JOB OFFER AND PROJECT BUDGET SCENARIOS
# ============================================================

def test_job_offer_practice_flow():
    res = client.post("/api/negotiations", json={
        "scenario_id": "job_offer",
        "mode": "practice",
        "human_role": "candidate"
    })
    session_id = res.json()["negotiation_id"]

    turn_res = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
        "offer": {"salary": 102000, "bonus": 15000, "remote_days": 3},
        "message": "Competitive salary with remote work arrangement."
    })
    assert turn_res.status_code == 200
    state = turn_res.json()
    assert len(state["history"]) == 2

def test_project_budget_practice_flow():
    res = client.post("/api/negotiations", json={
        "scenario_id": "project_budget",
        "mode": "practice",
        "human_role": "department_head"
    })
    session_id = res.json()["negotiation_id"]

    turn_res = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
        "offer": {"budget": 85000, "scope": 90, "deadline_weeks": 16},
        "message": "Full scope allocation."
    })
    assert turn_res.status_code == 200
    state = turn_res.json()
    assert len(state["history"]) == 2
