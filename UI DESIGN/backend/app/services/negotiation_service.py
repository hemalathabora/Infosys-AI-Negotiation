import uuid
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.negotiation import NegotiationModel
from app.models.message import NegotiationMessageModel
from app.models.agent import AgentModel
from app.services.orchestrator import NegotiationOrchestrator

DEFAULT_SCENARIOS = {
    "vendor_pricing": {
        "scenario_id": "vendor_pricing",
        "scenario_name": "Vendor Pricing Negotiation",
        "agents": [
            {
                "id": "buyer",
                "name": "Buyer Agent",
                "role": "buyer",
                "persona": "Aggressive but professional negotiator",
                "goals": ["Get the lowest possible price", "Complete the purchase"],
                "constraints": {"maximum_price": 85000, "quantity": 100},
                "negotiation_objectives": ["Target price is 75000", "Never exceed maximum price"]
            },
            {
                "id": "vendor",
                "name": "Vendor Agent",
                "role": "vendor",
                "persona": "Firm but willing to compromise",
                "goals": ["Maximize profit", "Close the deal"],
                "constraints": {"minimum_price": 80000, "quantity": 100},
                "negotiation_objectives": ["Target price is 95000", "Never accept below 80000"]
            }
        ]
    }
}

def get_or_create_default_agents(db: Session) -> List[Dict[str, Any]]:
    agents = []
    for default_agent in DEFAULT_SCENARIOS["vendor_pricing"]["agents"]:
        db_agent = db.query(AgentModel).filter(AgentModel.id == default_agent["id"]).first()
        if not db_agent:
            db_agent = AgentModel(
                id=default_agent["id"],
                name=default_agent["name"],
                role=default_agent["role"],
                persona=default_agent["persona"]
            )
            db_agent.goals = default_agent["goals"]
            db_agent.constraints = default_agent["constraints"]
            db_agent.negotiation_objectives = default_agent["negotiation_objectives"]
            db.add(db_agent)
            db.commit()
            db.refresh(db_agent)
        agents.append(db_agent.to_dict())
    return agents

def create_negotiation_session(
    db: Session,
    scenario_id: str = "vendor_pricing",
    agent_profiles: Optional[List[Dict[str, Any]]] = None,
    max_rounds: int = 8
) -> NegotiationOrchestrator:
    negotiation_id = str(uuid.uuid4())

    if not agent_profiles:
        # Check if agents exist in DB or fallback to default vendor pricing agents
        agent_profiles = get_or_create_default_agents(db)

    # Save initial negotiation state to DB
    initial_turn = agent_profiles[0]["id"] if agent_profiles else "buyer"
    db_neg = NegotiationModel(
        negotiation_id=negotiation_id,
        scenario_id=scenario_id,
        current_round=0,
        max_rounds=max_rounds,
        current_agent_turn=initial_turn,
        status="active"
    )
    db_neg.participating_agents = agent_profiles
    db_neg.current_offer = None
    db_neg.previous_offer = None

    db.add(db_neg)
    db.commit()
    db.refresh(db_neg)

    return NegotiationOrchestrator(
        negotiation_id=negotiation_id,
        scenario_id=scenario_id,
        agents=agent_profiles,
        max_rounds=max_rounds,
        current_round=0,
        current_agent_turn=initial_turn,
        status="active",
        current_offer=None,
        previous_offer=None,
        history=[]
    )

def load_orchestrator(db: Session, negotiation_id: str) -> Optional[NegotiationOrchestrator]:
    db_neg = db.query(NegotiationModel).filter(NegotiationModel.negotiation_id == negotiation_id).first()
    if not db_neg:
        return None

    # Load messages
    messages = db.query(NegotiationMessageModel).filter(
        NegotiationMessageModel.negotiation_id == negotiation_id
    ).order_by(NegotiationMessageModel.id.asc()).all()

    history = [m.to_dict() for m in messages]

    return NegotiationOrchestrator(
        negotiation_id=db_neg.negotiation_id,
        scenario_id=db_neg.scenario_id,
        agents=db_neg.participating_agents,
        max_rounds=db_neg.max_rounds,
        current_round=db_neg.current_round,
        current_agent_turn=db_neg.current_agent_turn,
        status=db_neg.status,
        current_offer=db_neg.current_offer,
        previous_offer=db_neg.previous_offer,
        history=history
    )

def save_orchestrator_state(db: Session, orch: NegotiationOrchestrator):
    db_neg = db.query(NegotiationModel).filter(NegotiationModel.negotiation_id == orch.negotiation_id).first()
    if not db_neg:
        return

    db_neg.current_round = orch.current_round
    db_neg.current_agent_turn = orch.current_agent_turn
    db_neg.status = orch.status
    db_neg.current_offer = orch.current_offer
    db_neg.previous_offer = orch.previous_offer

    # Save any new history items
    existing_count = db.query(NegotiationMessageModel).filter(
        NegotiationMessageModel.negotiation_id == orch.negotiation_id
    ).count()

    if len(orch.history) > existing_count:
        for new_item in orch.history[existing_count:]:
            msg = NegotiationMessageModel(
                negotiation_id=orch.negotiation_id,
                round=new_item.get("round", orch.current_round),
                agent_id=new_item["agent_id"],
                decision=new_item["decision"],
                reasoning=new_item["reasoning"]
            )
            msg.proposed_offer = new_item.get("proposed_offer")
            msg.parameters = new_item.get("parameters")
            db.add(msg)

    db.commit()
    db.refresh(db_neg)
