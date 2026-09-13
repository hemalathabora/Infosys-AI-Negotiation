import pytest
from app.services.offer_evaluation import evaluate_offer, OfferEvaluationResult, parse_target_price
from app.services.decision_logic import decide_action, generate_counteroffer, CONCESSION_RATE

BUYER_PROFILE = {
    "id": "buyer_1",
    "name": "Alex Morgan",
    "role": "buyer",
    "persona": "Collaborative",
    "goals": ["Reduce procurement costs"],
    "constraints": {"maximum_price": 85000, "quantity": 100},
    "negotiation_objectives": ["Target price is 75000"]
}

VENDOR_PROFILE = {
    "id": "vendor_1",
    "name": "Daniel Carter",
    "role": "vendor",
    "persona": "Aggressive",
    "goals": ["Maximize sales revenue"],
    "constraints": {"minimum_price": 80000, "quantity": 100},
    "negotiation_objectives": ["Target price is 95000"]
}

def test_parse_target_price():
    target_b = parse_target_price(BUYER_PROFILE["negotiation_objectives"], BUYER_PROFILE["goals"], 85000, "minimize")
    assert target_b == 75000.0

    target_v = parse_target_price(VENDOR_PROFILE["negotiation_objectives"], VENDOR_PROFILE["goals"], 80000, "maximize")
    assert target_v == 95000.0

def test_opening_turn_evaluation():
    res = evaluate_offer(BUYER_PROFILE, None, {"current_round": 1})
    assert res.opponent_price is None
    assert res.is_within_limit is True
    assert res.is_acceptable is False

    decision = decide_action(res, "Collaborative", 75000.0, round_num=1)
    assert decision["decision"] == "counter"
    assert decision["next_value"] > 0

def test_favorable_offer_evaluation_and_accept_decision():
    """Requirement 7: Test very favorable offer -> ACCEPT decision."""
    favorable_opp_offer = {"price": 72000, "quantity": 100}  # Below buyer target of 75k
    res = evaluate_offer(BUYER_PROFILE, favorable_opp_offer, {"current_round": 1})

    assert res.is_favorable is True
    assert res.is_within_limit is True
    assert res.is_acceptable is True

    decision = decide_action(res, "Collaborative", own_last_value=72000, round_num=1)
    assert decision["decision"] == "accept"
    assert decision["next_value"] == 72000

def test_partially_acceptable_offer_evaluation_and_counter_decision():
    """Requirement 7: Test partially acceptable offer -> COUNTER decision."""
    partial_opp_offer = {"price": 82000, "quantity": 100}  # Between target 75k and max limit 85k
    res = evaluate_offer(BUYER_PROFILE, partial_opp_offer, {"current_round": 1})

    assert res.is_favorable is False
    assert res.is_within_limit is True
    assert res.is_acceptable is False  # Round 1, not close gap yet

    decision = decide_action(res, "Collaborative", own_last_value=72000, round_num=1)
    assert decision["decision"] == "counter"
    # Should counter at a price between own last value (72000) and incoming (82000), bounded by limit 85000
    assert 72000 < decision["next_value"] < 82000

def test_unacceptable_offer_evaluation_and_reject_decision():
    """Requirement 7: Test unacceptable offer -> REJECT decision."""
    unacceptable_opp_offer = {"price": 95000, "quantity": 100}  # Exceeds maximum limit of 85k
    # At final round (max_rounds=8, round_num=8), an offer exceeding budget limit must be REJECTED
    res = evaluate_offer(BUYER_PROFILE, unacceptable_opp_offer, {"current_round": 8, "max_rounds": 8})

    assert res.is_within_limit is False
    assert res.is_unacceptable is True

    decision = decide_action(res, "Collaborative", own_last_value=84000, round_num=8, max_rounds=8)
    assert decision["decision"] == "reject"

def test_personality_counteroffer_generation():
    """Requirement 3 & 4: Test personality influence on counteroffer generation."""
    agg_next = generate_counteroffer(BUYER_PROFILE, own_last_value=70000, incoming_value=85000, limit=85000, direction="minimize", personality="Aggressive", round_num=2)
    collab_next = generate_counteroffer(BUYER_PROFILE, own_last_value=70000, incoming_value=85000, limit=85000, direction="minimize", personality="Collaborative", round_num=2)

    # Aggressive makes smaller concession than Collaborative
    assert agg_next < collab_next
    assert agg_next <= 85000
    assert collab_next <= 85000
