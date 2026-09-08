
import pytest
import asyncio
from app.services.orchestrator import NegotiationOrchestrator

@pytest.mark.asyncio
async def test_orchestrator_turn_flow():
    agent1 = {
        "id": "agent_1",
        "name": "Buyer",
        "role": "buyer",
        "persona": "Aggressive",
        "goals": ["Save money"],
        "constraints": {"maximum_price": 50000}
    }
    agent2 = {
        "id": "agent_2",
        "name": "Vendor",
        "role": "vendor",
        "persona": "Firm",
        "goals": ["Profit"],
        "constraints": {"minimum_price": 40000}
    }

    orch = NegotiationOrchestrator(
        negotiation_id="test_orch_id",
        scenario_id="test_scen",
        agents=[agent1, agent2],
        max_rounds=3
    )

    assert orch.get_current_agent()["id"] == "agent_1"
    assert orch.current_round == 0

    res1 = await orch.run_turn()
    assert orch.current_round == 1
    assert orch.current_agent_turn == "agent_2"
    assert len(orch.history) == 1

    res2 = await orch.run_turn()
    assert len(orch.history) == 2
    assert orch.status in ["active", "accepted", "agreement"]
