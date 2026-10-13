import pytest
import asyncio
from app.services.llm_reasoning import (
    generate_agent_response,
    validate_agent_constraints,
    mock_llm_reasoning,
    parse_numeric_constraint,
    extract_offer_price
)
from app.schemas.response import LLMStructuredResponse

def test_parse_numeric_constraint():
    constraints = {"maximum_price": 85000, "quantity": 100}
    max_p, min_p, qty = parse_numeric_constraint(constraints, "buyer")
    assert max_p == 85000.0
    assert qty == 100

    vendor_constraints = [{"text": "Minimum $80,000", "defaultValue": 80000}]
    max_p2, min_p2, qty2 = parse_numeric_constraint(vendor_constraints, "vendor")
    assert min_p2 == 80000.0

def test_constraint_validation_buyer_exceeds():
    agent_profile = {
        "role": "buyer",
        "constraints": {"maximum_price": 85000}
    }
    # LLM proposed offer exceeding buyer limit
    invalid_llm_res = LLMStructuredResponse(
        decision="counter",
        offer={"price": 90000, "quantity": 100},
        reasoning="I will offer 90000"
    )

    valid, msg, adjusted = validate_agent_constraints(agent_profile, invalid_llm_res)
    assert valid is False
    assert "violates maximum constraint" in msg
    assert extract_offer_price(adjusted.offer) == 85000.0

def test_constraint_validation_vendor_below_minimum():
    agent_profile = {
        "role": "vendor",
        "constraints": {"minimum_price": 80000}
    }
    # LLM proposed offer below vendor limit
    invalid_llm_res = LLMStructuredResponse(
        decision="counter",
        offer={"price": 75000, "quantity": 100},
        reasoning="I will accept 75000"
    )

    valid, msg, adjusted = validate_agent_constraints(agent_profile, invalid_llm_res)
    assert valid is False
    assert "violates minimum floor" in msg
    assert extract_offer_price(adjusted.offer) == 80000.0

@pytest.mark.asyncio
async def test_generate_agent_response():
    buyer_profile = {
        "id": "buyer",
        "name": "Buyer Agent",
        "role": "buyer",
        "persona": "Aggressive",
        "goals": ["Lowest price"],
        "constraints": {"maximum_price": 85000},
        "negotiation_objectives": ["Target price 75000"]
    }
    neg_state = {"current_round": 1, "max_rounds": 8, "status": "active"}

    res = await generate_agent_response(buyer_profile, neg_state, [], None)
    assert res.decision in ["counter", "accept", "reject"]
    assert res.offer is not None
    assert res.reasoning != ""
