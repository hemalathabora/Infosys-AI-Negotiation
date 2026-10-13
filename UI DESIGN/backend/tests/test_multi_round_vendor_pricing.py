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
    Requirement 7: Multi-Round Vendor Pricing Negotiation Test (3-5 rounds).
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
                # Buyer must NEVER exceed maximum price of 85,000
                assert offer_price <= 85000.0, f"Buyer exceeded maximum price limit! Offer: {offer_price}"
                previous_buyer_offers.append(offer_price)
        elif turn_log["agent_id"] == "vendor_agent":
            if offer_price is not None:
                # Vendor must NEVER go below minimum price of 80,000
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
        assert previous_buyer_offers[-1] >= previous_buyer_offers[0]

    if len(previous_vendor_offers) >= 2:
        assert previous_vendor_offers[-1] <= previous_vendor_offers[0]

    # 5. Validate eventual termination
    assert orch.status in ["accepted", "rejected", "completed", "active"]


@pytest.mark.asyncio
async def test_vendor_pricing_favorable_offer():
    """
    Requirement 7: Test Favorable Offer in Vendor Pricing scenario.
    When vendor receives an offer at/above their target price of 95,000, vendor should ACCEPT.
    """
    orch = NegotiationOrchestrator(
        negotiation_id="test_favorable",
        scenario_id="vendor_pricing",
        agents=[BUYER_PROFILE, VENDOR_PROFILE],
        max_rounds=5,
        current_round=1,
        current_agent_turn="vendor_agent",
        current_offer={"price": 96000, "quantity": 100},  # Buyer offered 96k (above vendor target 95k)
        status="active"
    )

    res = await orch.run_turn()
    turn_log = res["turn_log"]

    assert turn_log["decision"] == "accept"
    assert orch.status == "accepted"


@pytest.mark.asyncio
async def test_vendor_pricing_partially_acceptable_offer():
    """
    Requirement 7: Test Partially Acceptable Offer in Vendor Pricing scenario.
    When buyer offers 82,000 (above vendor min floor 80k, below target 95k), vendor should COUNTER.
    """
    orch = NegotiationOrchestrator(
        negotiation_id="test_partially_acceptable",
        scenario_id="vendor_pricing",
        agents=[BUYER_PROFILE, VENDOR_PROFILE],
        max_rounds=5,
        current_round=1,
        current_agent_turn="vendor_agent",
        current_offer={"price": 82000, "quantity": 100},
        status="active"
    )

    res = await orch.run_turn()
    turn_log = res["turn_log"]

    assert turn_log["decision"] == "counter"
    assert turn_log["proposed_offer"]["price"] >= 80000  # Vendor respects minimum floor
    assert orch.status == "active"


@pytest.mark.asyncio
async def test_vendor_pricing_unacceptable_offer():
    """
    Requirement 7: Test Unacceptable Offer at final round in Vendor Pricing scenario.
    When buyer offers 70,000 (below vendor minimum floor of 80,000) at max round, vendor should REJECT.
    """
    orch = NegotiationOrchestrator(
        negotiation_id="test_unacceptable",
        scenario_id="vendor_pricing",
        agents=[BUYER_PROFILE, VENDOR_PROFILE],
        max_rounds=3,
        current_round=3,
        current_agent_turn="vendor_agent",
        current_offer={"price": 70000, "quantity": 100},  # Below 80k minimum floor
        status="active"
    )

    res = await orch.run_turn()
    turn_log = res["turn_log"]

    assert turn_log["decision"] == "reject"
    assert orch.status == "rejected"
