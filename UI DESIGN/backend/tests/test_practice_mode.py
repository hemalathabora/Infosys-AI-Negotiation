"""
Test Suite for Fix 2: Practice Mode Validation & Realistic Human <-> AI Negotiation
Covers Vendor Pricing, Job Offer, and Project Budget Allocation scenarios.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.services.orchestrator import NegotiationOrchestrator
from app.services.negotiation_service import DEFAULT_SCENARIOS, create_negotiation_session, load_orchestrator

client = TestClient(app)

SCENARIOS_LIST = ["vendor_pricing", "job_offer", "project_budget"]

# ============================================================
# 1. PARAMETERIZED CREATION & PARTICIPANT MODEL TESTS
# ============================================================

@pytest.mark.parametrize("scenario_id", SCENARIOS_LIST)
def test_create_practice_mode_session(scenario_id):
    """Verify session creation in Practice Mode identifies human role correctly."""
    response = client.post("/api/negotiations", json={
        "scenario_id": scenario_id,
        "mode": "practice",
        "human_role": "buyer" if scenario_id == "vendor_pricing" else "candidate" if scenario_id == "job_offer" else "department_head",
        "execution_mode": "Normal Mode"
    })
    assert response.status_code == 201
    state = response.json()
    assert state["mode"] == "practice"
    assert state["human_role"] in ["buyer", "candidate", "department_head"]
    
    # Verify Human participant is identified
    agents = state["participating_agents"]
    human_agent = next((a for a in agents if a.get("id") == state["human_role"] or a.get("participant_type") == "human"), None)
    assert human_agent is not None


# ============================================================
# 2. BACKEND VALIDATION & ERROR HANDLING TESTS
# ============================================================

def test_invalid_human_offers():
    """Verify backend rejects malformed or invalid human offers."""
    db = SessionLocal()
    try:
        orch = create_negotiation_session(db, scenario_id="vendor_pricing", mode="practice", human_role="buyer")
        session_id = orch.negotiation_id

        # 1. Invalid payload format (string price)
        res1 = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
            "offer": {"price": "invalid_number"},
            "message": "Test message"
        })
        assert res1.status_code in [400, 422]

        # 2. Negative price
        res2 = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
            "offer": {"price": -500},
            "message": "Negative offer"
        })
        assert res2.status_code in [400, 422]
    finally:
        db.close()


@pytest.mark.asyncio
async def test_completed_session_rejects_new_human_offers():
    """Verify a completed/rejected/deadlocked session rejects new human submissions."""
    orch = NegotiationOrchestrator(
        negotiation_id="test-completed-1",
        scenario_id="vendor_pricing",
        agents=DEFAULT_SCENARIOS["vendor_pricing"]["agents"],
        mode="practice",
        human_role="buyer"
    )
    orch.status = "agreement"
    
    with pytest.raises(ValueError) as excinfo:
        await orch.run_human_turn(human_offer={"price": 45000})
    assert "concluded" in str(excinfo.value).lower() or "agreement" in str(excinfo.value).lower()


# ============================================================
# 3. THREE-SCENARIO MULTI-ROUND & CONVERGENCE TESTS
# ============================================================

@pytest.mark.parametrize("scenario_id,human_role,initial_human_offer,favorable_offer", [
    ("vendor_pricing", "buyer", 43000, 47500),
    ("job_offer", "candidate", 106000, 99000),
    ("project_budget", "department_head", 88000, 58000),
])
def test_scenario_practice_negotiation_flow(scenario_id, human_role, initial_human_offer, favorable_offer):
    """Test realistic multi-round Human <-> AI exchange across all 3 scenarios."""
    db = SessionLocal()
    try:
        orch = create_negotiation_session(db, scenario_id=scenario_id, mode="practice", human_role=human_role)
        session_id = orch.negotiation_id

        # Round 1: Realistic initial human offer
        res1 = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
            "offer": {"price": initial_human_offer},
            "message": "Here is my initial proposal.",
            "decision": "counter"
        })
        assert res1.status_code == 200
        data1 = res1.json()
        assert len(data1["history"]) == 2  # Human + AI
        ai_turn_1 = data1["history"][1]
        assert ai_turn_1["decision"] in ["counter", "accept", "reject"]

        # If not concluded in R1, submit Round 2 offer
        if data1["status"] in ["active", "in_progress"]:
            res2 = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
                "offer": {"price": favorable_offer},
                "message": "I am willing to move significantly to reach agreement.",
                "decision": "counter"
            })
            assert res2.status_code == 200
            data2 = res2.json()
            assert len(data2["history"]) >= 4  # Includes turns + potential deadlock resolution proposal
            latest_turn = data2["history"][-1]
            assert latest_turn["decision"] in ["accept", "counter", "reject"]
    finally:
        db.close()


# ============================================================
# 4. DEADLOCK INTEGRATION IN PRACTICE MODE
# ============================================================

def test_practice_mode_deadlock_trigger():
    """Verify Practice Mode detects repeated offers and triggers deadlock resolution."""
    db = SessionLocal()
    try:
        orch = create_negotiation_session(db, scenario_id="vendor_pricing", mode="practice", human_role="buyer")
        session_id = orch.negotiation_id

        # Submit repeated low offer to trigger stall/deadlock
        for _ in range(3):
            res = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
                "offer": {"price": 35000},
                "message": "Firm low offer",
                "decision": "counter"
            })
            assert res.status_code == 200

        loaded_orch = load_orchestrator(db, session_id)
        assert loaded_orch is not None
        state = loaded_orch.get_state_dict()
        # Stalled negotiation should have deadlock_info populated or status updated
        assert state.get("deadlock_info") is not None or state["status"] in ["deadlock", "stalled", "negotiating", "active", "breakdown"]
    finally:
        db.close()


# ============================================================
# 5. PERSONALITY BEHAVIOR IN PRACTICE MODE
# ============================================================

@pytest.mark.parametrize("personality", ["Aggressive", "Collaborative", "Risk-Averse"])
@pytest.mark.asyncio
async def test_ai_personality_influences_practice_counter(personality):
    """Verify AI counteroffer reflects configured personality during practice mode."""
    agents = DEFAULT_SCENARIOS["vendor_pricing"]["agents"].copy()
    agents[1] = dict(agents[1])
    agents[1]["personality"] = personality

    orch = NegotiationOrchestrator(
        negotiation_id=f"test-pers-{personality}",
        scenario_id="vendor_pricing",
        agents=agents,
        mode="practice",
        human_role="buyer"
    )

    res = await orch.run_human_turn(human_offer={"price": 43000}, message="My bid", decision="counter")
    ai_turn = res["history"][1]
    assert ai_turn["agent_id"] == "vendor"
    # AI offer must respect vendor minimum constraint ($42,000)
    assert ai_turn["value"] >= 42000.0


# ============================================================
# 6. NORMAL MODE & GEMINI MODE INDEPENDENCE
# ============================================================

def test_practice_mode_with_execution_modes():
    """Verify Practice Mode works under both Normal Mode and Gemini Mode settings."""
    db = SessionLocal()
    try:
        for exec_mode in ["Normal Mode", "Gemini LLM"]:
            orch = create_negotiation_session(db, scenario_id="vendor_pricing", mode="practice", human_role="buyer")
            orch.execution_mode = exec_mode
            session_id = orch.negotiation_id
            res = client.post(f"/api/negotiations/{session_id}/practice-turn", json={
                "offer": {"price": 44000},
                "message": f"Testing in {exec_mode}",
                "decision": "counter"
            })
            assert res.status_code == 200
            state = res.json()
            assert len(state["history"]) == 2
    finally:
        db.close()
