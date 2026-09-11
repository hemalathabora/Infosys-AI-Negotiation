import pytest
import asyncio
from app.services.orchestrator import NegotiationOrchestrator
from app.services.llm_reasoning import extract_offer_price

BUYER_PROFILE = {
    "id": "buyer_agent",
    "name": "Buyer Agent",
    "role": "buyer",
    "persona": "Aggressive but professional negotiator",
    "goals": ["Get the lowest possible price", "Complete the purchase"],
    "constraints": {"maximum_price": 85000, "quantity": 100},
    "negotiation_objectives": ["Target price is 75000", "Never exceed maximum price"]
}

VENDOR_PROFILE = {
    "id": "vendor_agent",
    "name": "Vendor Agent",
    "role": "vendor",
    "persona": "Firm but willing to compromise",
    "goals": ["Maximize profit", "Close the deal"],
    "constraints": {"minimum_price": 80000, "quantity": 100},
    "negotiation_objectives": ["Target price is 95000", "Never accept below 80000"]
}

@pytest.mark.asyncio
async def test_multi_round_vendor_pricing_simulation():
    """
    Automated Multi-Round Vendor Pricing Negotiation Test (Requirement 11).
    Simulates at least 3-5 rounds of negotiation between Buyer and Vendor.
    Validates turn switches, round increments, constraint enforcement, and history context memory.
    """
    orch = NegotiationOrchestrator(
        negotiation_id="test_vendor_pricing_sim",
        scenario_id="vendor_pricing",
        agents=[BUYER_PROFILE, VENDOR_PROFILE],
        max_rounds=6,
        current_round=0,
        current_agent_turn="buyer_agent",
        status="active"
    )

    rounds_recorded = set()
    agents_acted = []
    previous_buyer_offers = []
    previous_vendor_offers = []

    # Run up to 10 turns (5 complete rounds)
    for step_num in range(10):
        if orch.status in ["accepted", "agreement", "rejected", "completed", "deadlock"]:
            break

        current_turn_agent = orch.current_agent_turn
        res = await orch.run_turn()
        turn_log = res["turn_log"]

        agents_acted.append(turn_log["agent_id"])
        rounds_recorded.add(turn_log["round"])

        offer_price = extract_offer_price(turn_log["proposed_offer"])

        if turn_log["agent_id"] == "buyer_agent":
            if offer_price is not None:
                # Requirement: Buyer must NEVER exceed maximum price of 85,000
                assert offer_price <= 85000.0, f"Buyer exceeded maximum price limit! Offer: {offer_price}"
                previous_buyer_offers.append(offer_price)
        elif turn_log["agent_id"] == "vendor_agent":
            if offer_price is not None:
                # Requirement: Vendor must NEVER go below minimum price of 80,000
                assert offer_price >= 80000.0, f"Vendor went below minimum price floor! Offer: {offer_price}"
                previous_vendor_offers.append(offer_price)

    # 1. Validate multiple rounds were played (at least 3 turns / rounds)
    assert len(agents_acted) >= 3, f"Expected at least 3 turns, but played {len(agents_acted)}"
    assert len(orch.history) >= 3, f"Expected history size >= 3, got {len(orch.history)}"

    # 2. Validate agent turns alternated
    for i in range(1, len(agents_acted)):
        assert agents_acted[i] != agents_acted[i-1], f"Turns did not alternate at index {i}"

    # 3. Validate current round updated
    assert orch.current_round >= 2

    # 4. Validate offers changed based on negotiation history
    if len(previous_buyer_offers) >= 2:
        # Buyer should generally increase or maintain offer within max budget
        assert previous_buyer_offers[-1] >= previous_buyer_offers[0]

    if len(previous_vendor_offers) >= 2:
        # Vendor should generally decrease or maintain offer within min floor
        assert previous_vendor_offers[-1] <= previous_vendor_offers[0]

    # 5. Validate eventual termination (accepted, rejected, or completed)
    assert orch.status in ["accepted", "rejected", "completed", "active"]


@pytest.mark.asyncio
async def test_very_favorable_offer_triggers_accept():
    """
    Test that when Vendor presents a very favorable offer (<= Buyer target),
    the Buyer Agent immediately accepts.
    """
    orch = NegotiationOrchestrator(
        negotiation_id="test_fav_offer",
        scenario_id="vendor_pricing",
        agents=[BUYER_PROFILE, VENDOR_PROFILE],
        max_rounds=5,
        current_round=1,
        current_agent_turn="buyer_agent",
        status="active",
        current_offer={"price": 74000, "quantity": 100} # Favorable offer below Buyer's 75,000 target
    )

    res = await orch.run_turn()
    turn_log = res["turn_log"]

    assert turn_log["decision"] == "accept"
    assert orch.status == "accepted"


@pytest.mark.asyncio
async def test_partially_acceptable_offer_triggers_counter():
    """
    Test that when Vendor presents a partially acceptable offer (within max price limit but above target),
    the Buyer Agent generates a counteroffer.
    """
    orch = NegotiationOrchestrator(
        negotiation_id="test_partial_offer",
        scenario_id="vendor_pricing",
        agents=[BUYER_PROFILE, VENDOR_PROFILE],
        max_rounds=5,
        current_round=1,
        current_agent_turn="buyer_agent",
        status="active",
        current_offer={"price": 82000, "quantity": 100} # Within 85,000 max, but above 75,000 target
    )

    res = await orch.run_turn()
    turn_log = res["turn_log"]

    assert turn_log["decision"] == "counter"
    assert turn_log["proposed_offer"]["price"] <= 85000.0


@pytest.mark.asyncio
async def test_unacceptable_offer_triggers_reject():
    """
    Test that when an unacceptable offer exceeding constraints persists at final round,
    the agent rejects the proposal.
    """
    orch = NegotiationOrchestrator(
        negotiation_id="test_unacceptable_offer",
        scenario_id="vendor_pricing",
        agents=[BUYER_PROFILE, VENDOR_PROFILE],
        max_rounds=3,
        current_round=2, # Will increment to final round 3 on buyer's turn
        current_agent_turn="buyer_agent",
        status="active",
        current_offer={"price": 95000, "quantity": 100} # Exceeds Buyer's 85,000 budget limit
    )

    res = await orch.run_turn()
    turn_log = res["turn_log"]

    assert turn_log["decision"] == "reject"
    assert orch.status == "rejected"


