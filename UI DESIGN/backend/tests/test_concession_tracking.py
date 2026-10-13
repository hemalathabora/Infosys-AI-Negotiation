import pytest
from app.services.concession_tracking import (
    calculate_concession,
    apply_concession_control,
    calculate_rate_of_concession_decay,
    get_authoritative_target,
    get_agent_initial_position,
    get_agent_previous_position,
    extract_scalar_price
)
from app.services.offer_evaluation import evaluate_offer
from app.services.decision_logic import decide_action
from app.services.analytics_service import calculate_negotiation_analytics
from app.services.orchestrator import NegotiationOrchestrator
from app.schemas.response import LLMStructuredResponse
from app.services.llm_reasoning import validate_agent_constraints
from app.config import settings


# TEST 1 — No movement (95,000 -> 95,000)
def test_1_no_movement():
    agent_profile = {"role": "buyer", "constraints": {"maximum_price": 85000}, "personality": "Collaborative"}
    res = calculate_concession(
        agent_profile=agent_profile,
        previous_offer=95000,
        current_offer=95000,
        negotiation_state={"current_round": 2},
        initial_position=95000
    )
    assert res["concession_amount"] == 0
    assert res["concession_direction"] == "no_change"
    assert res["is_concession"] is False


# TEST 2 — Buyer concession (95,000 -> 92,000)
def test_2_buyer_concession():
    agent_profile = {"role": "buyer", "constraints": {"maximum_price": 85000}, "personality": "Collaborative"}
    res = calculate_concession(
        agent_profile=agent_profile,
        previous_offer=95000,
        current_offer=92000,
        negotiation_state={"current_round": 1},
        initial_position=95000
    )
    assert res["concession_amount"] == 3000
    assert res["concession_direction"] == "toward_target"
    assert res["is_concession"] is True


# TEST 3 — Vendor concession (75,000 -> 78,000)
def test_3_vendor_concession():
    agent_profile = {"role": "vendor", "constraints": {"minimum_price": 80000}, "personality": "Collaborative"}
    res = calculate_concession(
        agent_profile=agent_profile,
        previous_offer=75000,
        current_offer=78000,
        negotiation_state={"current_round": 1},
        initial_position=75000
    )
    assert res["concession_amount"] == 3000
    assert res["concession_direction"] == "toward_target"
    assert res["is_concession"] is True


# TEST 4 — Buyer movement away from target (90,000 -> 93,000)
def test_4_buyer_movement_away_from_target():
    agent_profile = {"role": "buyer", "constraints": {"maximum_price": 85000}, "personality": "Collaborative"}
    res = calculate_concession(
        agent_profile=agent_profile,
        previous_offer=90000,
        current_offer=93000,
        negotiation_state={"current_round": 2},
        initial_position=95000
    )
    assert res["concession_amount"] == 0  # True concession is 0
    assert res["concession_direction"] == "away_from_target"
    assert res["is_concession"] is False


# TEST 5 — Vendor movement away from target (80,000 -> 77,000)
def test_5_vendor_movement_away_from_target():
    agent_profile = {"role": "vendor", "constraints": {"minimum_price": 80000}, "personality": "Collaborative"}
    res = calculate_concession(
        agent_profile=agent_profile,
        previous_offer=80000,
        current_offer=77000,
        negotiation_state={"current_round": 2},
        initial_position=75000
    )
    assert res["concession_amount"] == 0  # True concession is 0
    assert res["concession_direction"] == "away_from_target"
    assert res["is_concession"] is False


# TEST 6 — Cumulative concession (95k -> 92k -> 90k -> 88k = 3k + 2k + 2k = 7k)
def test_6_cumulative_concession():
    agent_profile = {"id": "buyer_1", "role": "buyer", "constraints": {"maximum_price": 85000}}
    history = [
        {"agent_id": "buyer_1", "proposed_offer": {"price": 95000}},
        {"agent_id": "buyer_1", "proposed_offer": {"price": 92000}},
        {"agent_id": "buyer_1", "proposed_offer": {"price": 90000}},
    ]
    res = calculate_concession(
        agent_profile=agent_profile,
        previous_offer=90000,
        current_offer=88000,
        negotiation_state={"history": history, "current_round": 3},
        initial_position=95000
    )
    assert res["cumulative_concession"] == 7000.0


# TEST 7 — Concession Sum (Include both toward and away moves, only toward contributes)
def test_7_concession_sum_toward_and_away():
    agent_profile = {"id": "buyer_1", "role": "buyer", "constraints": {"maximum_price": 85000}}
    # Round 1: 95k -> 92k (3k)
    # Round 2: 92k -> 90k (2k)
    # Round 3: 90k -> 93k (away_from_target, 0k true concession)
    history = [
        {"agent_id": "buyer_1", "proposed_offer": {"price": 95000}},
        {"agent_id": "buyer_1", "proposed_offer": {"price": 92000}},
        {"agent_id": "buyer_1", "proposed_offer": {"price": 90000}},
        {"agent_id": "buyer_1", "proposed_offer": {"price": 93000}},
    ]
    res = calculate_concession(
        agent_profile=agent_profile,
        previous_offer=93000,
        current_offer=93000,
        negotiation_state={"history": history, "current_round": 4},
        initial_position=95000
    )
    assert res["concession_sum"] == 5000.0  # NOT 8000.0


# TEST 8 — Rate of Concession Decay (Positive decay: 5k, 4k, 2k, 1k)
def test_8_rate_of_concession_decay_positive():
    concessions = [5000.0, 4000.0, 2000.0, 1000.0]
    decay = calculate_rate_of_concession_decay(concessions)
    assert decay is not None
    assert decay > 0.0  # Shrinking concessions -> positive decay rate


# TEST 9 — Constant concessions (5k, 5k, 5k, 5k)
def test_9_rate_of_concession_decay_constant():
    concessions = [5000.0, 5000.0, 5000.0, 5000.0]
    decay = calculate_rate_of_concession_decay(concessions)
    assert decay == 0.0


# TEST 10 — Increasing concessions (2k, 4k, 6k, 8k)
def test_10_rate_of_concession_decay_increasing():
    concessions = [2000.0, 4000.0, 6000.0, 8000.0]
    decay = calculate_rate_of_concession_decay(concessions)
    assert decay is not None
    assert decay < 0.0  # Expanding concessions -> negative decay rate


# TEST 11 — Insufficient data (Only 1 concession)
def test_11_rate_of_concession_decay_insufficient_data():
    concessions = [3000.0]
    decay = calculate_rate_of_concession_decay(concessions)
    assert decay is None


# TEST 12 — Target consistency across all modules
def test_12_target_consistency():
    buyer = {
        "id": "buyer_1",
        "role": "buyer",
        "target_price": 42500.0,
        "constraints": {"maximum_price": 50000.0}
    }
    
    # 1. Authoritative resolver
    auth_target = get_authoritative_target(buyer)
    # 2. Offer Evaluation
    eval_res = evaluate_offer(buyer, {"price": 48000.0})
    # 3. Decision Logic
    dec_res = decide_action(eval_res, "Collaborative", own_last_value=42000.0, round_num=1)
    # 4. Concession Tracking
    conc_res = calculate_concession(buyer, 42000.0, 45000.0)

    assert auth_target == 42500.0
    assert eval_res.target_price == 42500.0
    assert conc_res["target_position"] == 42500.0


# TEST 13 — Multi-round Vendor Pricing negotiation (3-5 rounds)
@pytest.mark.asyncio
async def test_13_vendor_pricing_multi_round(monkeypatch):
    monkeypatch.setattr(settings, "LLM_PROVIDER", "mock")
    buyer = {
        "id": "buyer_1",
        "name": "Alex Morgan",
        "role": "buyer",
        "persona": "Collaborative",
        "target_price": 42500.0,
        "goals": ["Minimize price"],
        "constraints": {"maximum_price": 50000.0}
    }
    vendor = {
        "id": "vendor_1",
        "name": "Daniel Carter",
        "role": "vendor",
        "persona": "Collaborative",
        "target_price": 48000.0,
        "goals": ["Maximize margin"],
        "constraints": {"minimum_price": 42000.0}
    }

    orchestrator = NegotiationOrchestrator(
        negotiation_id="test_multi_round_13",
        scenario_id="vendor_pricing",
        agents=[buyer, vendor],
        max_rounds=5
    )

    state = await orchestrator.run_to_completion()
    assert state["status"] in ["accepted", "agreement", "completed"]
    assert len(state["history"]) >= 4

    # Analytics calculation verification
    analytics = calculate_negotiation_analytics(state)
    assert "agent_analytics" in analytics
    assert "buyer_1" in analytics["agent_analytics"]
    assert "vendor_1" in analytics["agent_analytics"]

    buyer_an = analytics["agent_analytics"]["buyer_1"]
    assert buyer_an["remaining_concession_capacity"] >= 0.0
    assert buyer_an["target_position"] == 42500.0

    # Ensure no acceptable limit was violated
    for turn in state["history"]:
        val = extract_scalar_price(turn.get("proposed_offer"))
        if turn["agent_id"] == "buyer_1":
            assert val <= 50000.0
        elif turn["agent_id"] == "vendor_1":
            assert val >= 42000.0
