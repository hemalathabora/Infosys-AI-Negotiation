from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.negotiation import (
    NegotiationCreate,
    NegotiationStateResponse,
    TurnResponse,
    OfferLog,
    PracticeTurnRequest,
    NegotiationSummary,
    ParseMessageRequest,
    ParseMessageResponse,
    HintResponse,
    NegotiationScorecard
)
from app.models.agent import AgentModel
from app.models.negotiation import NegotiationModel
from app.services.negotiation_service import (
    create_negotiation_session,
    load_orchestrator,
    save_orchestrator_state,
    get_or_create_default_agents,
    DEFAULT_SCENARIOS
)
from app.services.practice_service import (
    generate_negotiation_hint,
    parse_natural_language_offer,
    calculate_negotiation_scorecard
)
from app.services.tradeoff_engine import get_scenario_variables, calculate_utility

router = APIRouter(prefix="/api/negotiations", tags=["Negotiations"])

@router.get("", response_model=List[NegotiationSummary])
def list_negotiations(user_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieve historical negotiation sessions for a specific user from database."""
    if not user_id:
        return []

    query = db.query(NegotiationModel).filter(NegotiationModel.user_id == user_id)
    records = query.order_by(NegotiationModel.created_at.desc()).all()

    summaries = []
    for r in records:
        agents = r.participating_agents
        agents_str = " vs ".join([a.get("name", "Agent") for a in agents]) if agents else "Agents"
        scen_name = DEFAULT_SCENARIOS.get(r.scenario_id, {}).get("scenario_name", r.scenario_id.replace("_", " ").title())
        summaries.append(NegotiationSummary(
            negotiation_id=r.negotiation_id,
            scenario_id=r.scenario_id,
            scenario_name=scen_name,
            mode=r.mode or "simulation",
            status=r.status,
            current_round=r.current_round,
            max_rounds=r.max_rounds,
            agents_summary=agents_str,
            created_at=r.created_at.isoformat() if r.created_at else None,
            user_id=r.user_id
        ))
    return summaries

@router.post("", response_model=NegotiationStateResponse, status_code=status.HTTP_201_CREATED)
def create_negotiation(payload: NegotiationCreate, db: Session = Depends(get_db)):
    """Create and start a new negotiation session with multi-variable & practice mode support."""
    agents_data = []

    if payload.agents:
        agents_data = [a.model_dump() for a in payload.agents]
    elif payload.agent_ids:
        for aid in payload.agent_ids:
            db_agent = db.query(AgentModel).filter(AgentModel.id == aid).first()
            if db_agent:
                agents_data.append(db_agent.to_dict())
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Agent ID '{aid}' not found."
                )

    if not agents_data:
        scen_key = payload.scenario_id or "vendor_pricing"
        if scen_key in DEFAULT_SCENARIOS:
            import copy
            agents_data = copy.deepcopy(DEFAULT_SCENARIOS[scen_key]["agents"])
        else:
            agents_data = get_or_create_default_agents(db)

    # Apply AI personality if specified
    if payload.ai_personality:
        for a in agents_data:
            if a.get("participant_type") != "human" and a.get("id") != payload.human_role:
                a["personality"] = payload.ai_personality
                a["persona"] = payload.ai_personality

    orch = create_negotiation_session(
        db=db,
        scenario_id=payload.scenario_id or "vendor_pricing",
        agent_profiles=agents_data,
        max_rounds=payload.max_rounds or 5,
        mode=payload.mode or "simulation",
        human_role=payload.human_role,
        user_id=payload.user_id,
        difficulty=payload.difficulty or "Intermediate"
    )

    return NegotiationStateResponse(**orch.get_state_dict())


@router.get("/{negotiation_id}", response_model=NegotiationStateResponse)
def get_negotiation_state(negotiation_id: str, db: Session = Depends(get_db)):
    """Retrieve current negotiation session state."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )
    return NegotiationStateResponse(**orch.get_state_dict())

@router.post("/{negotiation_id}/turn")
async def run_negotiation_turn(negotiation_id: str, db: Session = Depends(get_db)):
    """Executes the current active agent's turn."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )

    if orch.status in ["accepted", "agreement", "rejected", "completed", "deadlock", "cancelled", "breakdown"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Negotiation '{negotiation_id}' has already completed with status '{orch.status}'."
        )

    res = await orch.run_turn()
    save_orchestrator_state(db, orch)

    last_turn = orch.history[-1] if orch.history else {}
    return {
        "turn": last_turn,
        "state": NegotiationStateResponse(**orch.get_state_dict())
    }

@router.post("/{negotiation_id}/practice-turn")
async def run_practice_turn(
    negotiation_id: str,
    payload: PracticeTurnRequest,
    db: Session = Depends(get_db)
):
    """Processes a human offer in Practice Mode and triggers AI response turn."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )

    if orch.status in ["accepted", "agreement", "rejected", "completed", "deadlock", "cancelled", "breakdown"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Negotiation session has already concluded with status '{orch.status}'."
        )

    try:
        updated_state = await orch.run_human_turn(
            human_offer=payload.offer,
            message=payload.message,
            decision=payload.decision or "counter"
        )
        save_orchestrator_state(db, orch)
        return NegotiationStateResponse(**updated_state)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

@router.post("/{negotiation_id}/hint", response_model=HintResponse)
def get_practice_hint(negotiation_id: str, db: Session = Depends(get_db)):
    """Generates an intelligent context-aware hint for the human participant."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )
    human_role = orch.human_role or "buyer"
    return generate_negotiation_hint(orch.get_state_dict(), orch.agents, human_role, orch.scenario_id)

@router.post("/{negotiation_id}/parse-message", response_model=ParseMessageResponse)
def parse_message_to_offer(negotiation_id: str, payload: ParseMessageRequest, db: Session = Depends(get_db)):
    """Parses natural language user message into a structured multi-variable offer."""
    orch = load_orchestrator(db, negotiation_id)
    scen_id = orch.scenario_id if orch else (payload.scenario_id or "vendor_pricing")
    success, extracted, confidence, msg = parse_natural_language_offer(payload.message, scen_id)
    return ParseMessageResponse(
        success=success,
        parsed_offer=extracted,
        detected_variables=extracted,
        confidence=confidence,
        message=msg
    )

@router.get("/{negotiation_id}/metrics")
def get_negotiation_metrics(negotiation_id: str, db: Session = Depends(get_db)):
    """Retrieves live telemetry, utility scores, and trade-off metrics."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )
    return orch.get_live_metrics()

@router.post("/{negotiation_id}/end", response_model=NegotiationScorecard)
def end_negotiation_session(
    negotiation_id: str,
    outcome: Optional[str] = "completed",
    db: Session = Depends(get_db)
):
    """Manually terminates a practice session and generates a transparent performance scorecard."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )

    orch.status = outcome or "completed"
    orch.current_agent_turn = None
    save_orchestrator_state(db, orch)

    human_agent = next((a for a in orch.agents if a.get("participant_type") == "human"), orch.agents[0])
    ai_agent = next((a for a in orch.agents if a.get("id") != human_agent.get("id")), orch.agents[-1])

    scorecard = calculate_negotiation_scorecard(
        negotiation_state=orch.get_state_dict(),
        human_agent=human_agent,
        ai_agent=ai_agent,
        scenario_id=orch.scenario_id
    )
    return scorecard

@router.post("/{negotiation_id}/run", response_model=NegotiationStateResponse)
async def run_to_completion(negotiation_id: str, db: Session = Depends(get_db)):
    """Runs the negotiation automatically until completion."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )

    await orch.run_to_completion()
    save_orchestrator_state(db, orch)

    return NegotiationStateResponse(**orch.get_state_dict())

@router.get("/{negotiation_id}/history", response_model=List[OfferLog])
def get_negotiation_history(negotiation_id: str, db: Session = Depends(get_db)):
    """Retrieve complete turn-by-turn conversation history log."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )
    return [OfferLog(**h) for h in orch.history]
