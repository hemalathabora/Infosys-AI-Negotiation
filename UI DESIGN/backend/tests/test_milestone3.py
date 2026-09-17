import pytest
from app.services.deadlock_detection import detect_deadlock, check_constraint_overlap, attempt_deadlock_resolution
from app.services.orchestrator import NegotiationOrchestrator
from app.services.negotiation_service import DEFAULT_SCENARIOS

def test_check_constraint_overlap_vendor_pricing():
    agents = DEFAULT_SCENARIOS["vendor_pricing"]["agents"]
    has_overlap, msg, lower_b, upper_b = check_constraint_overlap(agents)
    assert has_overlap is True
    assert "overlap" in msg.lower()
    assert lower_b == 42000.0
    assert upper_b == 50000.0

def test_check_constraint_overlap_non_overlapping():
    non_overlap_agents = [
        {
            "id": "buyer",
            "role": "buyer",
            "constraints": {"maximum_price": 40000}
        },
        {
            "id": "vendor",
            "role": "vendor",
            "constraints": {"minimum_price": 45000}
        }
    ]
    has_overlap, msg, lower_b, upper_b = check_constraint_overlap(non_overlap_agents)
    assert has_overlap is False
    assert "non-overlapping" in msg.lower()

def test_detect_deadlock_non_overlapping():
    non_overlap_agents = [
        {
            "id": "buyer",
            "role": "buyer",
            "constraints": {"maximum_price": 40000}
        },
        {
            "id": "vendor",
            "role": "vendor",
            "constraints": {"minimum_price": 45000}
        }
    ]
    res = detect_deadlock(
        negotiation_state={"current_round": 1, "current_offer": {"price": 40000}},
        history=[],
        agents=non_overlap_agents,
        scenario_id="vendor_pricing"
    )
    assert res["is_deadlock"] is True
    assert res["resolution_possible"] is False
    assert res["suggested_action"] == "declare_breakdown"


def test_project_budget_non_overlapping_constraints():
    agents = DEFAULT_SCENARIOS["project_budget"]["agents"]
    has_overlap, message, lower_bound, upper_bound = check_constraint_overlap(agents)

    assert has_overlap is False
    assert lower_bound is None
    assert upper_bound is None
    assert "non-overlapping" in message.lower()

    result = detect_deadlock(
        negotiation_state={"current_round": 1, "current_offer": {"price": 80000}},
        history=[],
        agents=agents,
        scenario_id="project_budget",
        max_rounds=5,
    )
    assert result["is_deadlock"] is True
    assert result["resolution_possible"] is False
    assert result["suggested_action"] == "declare_breakdown"

def test_detect_deadlock_repeated_offers():
    agents = DEFAULT_SCENARIOS["vendor_pricing"]["agents"]
    history = [
        {"agent_id": "buyer", "round": 1, "proposed_offer": {"price": 44000}, "value": 44000},
        {"agent_id": "vendor", "round": 1, "proposed_offer": {"price": 48000}, "value": 48000},
        {"agent_id": "buyer", "round": 2, "proposed_offer": {"price": 44000}, "value": 44000},
        {"agent_id": "vendor", "round": 2, "proposed_offer": {"price": 48000}, "value": 48000},
    ]
    res = detect_deadlock(
        negotiation_state={"current_round": 2, "current_offer": {"price": 48000}},
        history=history,
        agents=agents,
        scenario_id="vendor_pricing"
    )
    assert res["is_deadlock"] is True
    assert res["repeated_offers"] >= 2

@pytest.mark.asyncio
async def test_orchestrator_practice_mode_human_turn():
    agents = DEFAULT_SCENARIOS["vendor_pricing"]["agents"]
    orch = NegotiationOrchestrator(
        negotiation_id="test-prac-1",
        scenario_id="vendor_pricing",
        agents=agents,
        max_rounds=8,
        mode="practice",
        human_role="buyer"
    )
    assert orch.agents[0]["participant_type"] == "human"
    assert orch.agents[1]["participant_type"] == "ai"

    # Human submits an offer
    res = await orch.run_human_turn(
        human_offer={"price": 44000},
        message="I offer 44000 as my initial bid.",
        decision="counter"
    )

    assert len(orch.history) == 2  # Human turn + AI response turn
    assert orch.history[0]["agent_id"] == "buyer"
    assert orch.history[0]["parameters"]["is_human"] is True
    assert orch.history[1]["agent_id"] == "vendor"
    assert orch.history[1]["decision"] in ["counter", "accept", "reject"]

@pytest.mark.asyncio
async def test_simulation_mode_regression():
    agents = DEFAULT_SCENARIOS["job_offer"]["agents"]
    orch = NegotiationOrchestrator(
        negotiation_id="test-sim-1",
        scenario_id="job_offer",
        agents=agents,
        max_rounds=4,
        mode="simulation"
    )
    res = await orch.run_turn()
    assert res["turn_log"]["agent_id"] == "candidate"
    assert orch.current_agent_turn == "employer"

@pytest.mark.asyncio
async def test_deadlock_resolution_execution_flow():
    """TEST 1, 6, 7, 8: Feasible deadlock resolution generates real offer, updates current offer, and records history."""
    agents = DEFAULT_SCENARIOS["vendor_pricing"]["agents"]
    history = [
        {"agent_id": "buyer", "round": 1, "proposed_offer": {"price": 44000}, "value": 44000},
        {"agent_id": "vendor", "round": 1, "proposed_offer": {"price": 48000}, "value": 48000},
        {"agent_id": "buyer", "round": 2, "proposed_offer": {"price": 44000}, "value": 44000},
        {"agent_id": "vendor", "round": 2, "proposed_offer": {"price": 48000}, "value": 48000},
    ]

    orch = NegotiationOrchestrator(
        negotiation_id="test-deadlock-flow",
        scenario_id="vendor_pricing",
        agents=agents,
        max_rounds=8,
        current_round=2,
        current_agent_turn="buyer",
        history=history,
        current_offer={"price": 48000}
    )

    # Next turn triggers deadlock detection & resolution attempt
    res = await orch.run_turn()
    
    # Check that resolution attempt occurred
    assert orch.resolution_attempts == 1
    assert orch.deadlock_info.get("is_deadlock") is True
    assert orch.deadlock_info.get("resolution", {}).get("attempted") is True

    # Check that resolution offer was appended to history as a real offer
    res_offers = [h for h in orch.history if h.get("parameters", {}).get("is_resolution_offer") is True]
    assert len(res_offers) == 1
    res_entry = res_offers[0]
    assert res_entry["value"] >= 42000.0 and res_entry["value"] <= 50000.0
    assert res_entry["concession_data"] is not None

@pytest.mark.asyncio
async def test_infeasible_deadlock_breakdown():
    """TEST 2 & 9: Infeasible deadlock (non-overlapping constraints) terminates as breakdown without invalid compromise."""
    non_overlap_agents = [
        {
            "id": "buyer",
            "name": "Alex Morgan",
            "role": "buyer",
            "constraints": {"maximum_price": 40000}
        },
        {
            "id": "vendor",
            "name": "Daniel Carter",
            "role": "vendor",
            "constraints": {"minimum_price": 45000}
        }
    ]

    orch = NegotiationOrchestrator(
        negotiation_id="test-infeasible",
        scenario_id="vendor_pricing",
        agents=non_overlap_agents,
        max_rounds=8,
        current_round=1,
        current_agent_turn="buyer",
        history=[],
        current_offer={"price": 45000}
    )

    res = await orch.run_turn()

    assert orch.status == "breakdown"
    assert orch.deadlock_info["resolution_possible"] is False
    assert "non-overlapping" in orch.deadlock_info["reason"].lower()

@pytest.mark.asyncio
async def test_bounded_resolution_attempts_no_infinite_loop():
    """TEST 5 & 14: Bounded resolution attempts prevent infinite loops."""
    agents = DEFAULT_SCENARIOS["vendor_pricing"]["agents"]
    history = [
        {"agent_id": "buyer", "round": 1, "proposed_offer": {"price": 44000}, "value": 44000},
        {"agent_id": "vendor", "round": 1, "proposed_offer": {"price": 48000}, "value": 48000},
        {"agent_id": "buyer", "round": 2, "proposed_offer": {"price": 44000}, "value": 44000},
        {"agent_id": "vendor", "round": 2, "proposed_offer": {"price": 48000}, "value": 48000},
    ]

    orch = NegotiationOrchestrator(
        negotiation_id="test-no-loop",
        scenario_id="vendor_pricing",
        agents=agents,
        max_rounds=8,
        current_round=2,
        current_agent_turn="buyer",
        history=history,
        current_offer={"price": 48000}
    )

    await orch.run_turn()
    assert orch.status in ["accepted", "breakdown", "rejected"]
    # Verify execution terminated without hanging
    assert orch.current_agent_turn is None

