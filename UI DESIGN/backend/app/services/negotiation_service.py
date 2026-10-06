import uuid
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.negotiation import NegotiationModel
from app.models.message import NegotiationMessageModel
from app.models.agent import AgentModel
from app.services.orchestrator import NegotiationOrchestrator

from app.models.custom_scenario import CustomScenarioModel

DEFAULT_SCENARIOS = {
    "vendor_pricing": {
        "scenario_id": "vendor_pricing",
        "scenario_name": "Vendor Pricing Negotiation",
        "category": "Purchasing",
        "description": "Buyer and Vendor negotiate the price of a bulk components order while balancing budget, profit, and acceptable terms.",
        "participants": ["Buyer", "Vendor"],
        "variables": ["price", "delivery_days", "warranty_months", "support_months", "payment_terms"],
        "agents": [
            {
                "id": "buyer",
                "name": "Alex Morgan",
                "role": "buyer",
                "persona": "Risk-averse",
                "goals": ["Lowest possible unit price"],
                "constraints": {"maximum_price": 50000, "quantity": 100},
                "variable_weights": {"price": 0.45, "delivery_days": 0.25, "warranty_months": 0.15, "support_months": 0.15},
                "negotiation_objectives": ["Target price is 42500", "Maximum $50,000 budget limit"]
            },
            {
                "id": "vendor",
                "name": "Daniel Carter",
                "role": "vendor",
                "persona": "Aggressive",
                "goals": ["Maximize profit margin"],
                "constraints": {"minimum_price": 42000, "quantity": 100},
                "variable_weights": {"price": 0.40, "delivery_days": 0.25, "warranty_months": 0.20, "support_months": 0.15},
                "negotiation_objectives": ["Target price is 48000", "Minimum $42,000 price floor"]
            }
        ]
    },
    "job_offer": {
        "scenario_id": "job_offer",
        "scenario_name": "Job Offer Negotiation",
        "category": "Employment",
        "description": "Candidate and Employer negotiate salary and start terms for a new role while balancing compensation expectations against budget limits.",
        "participants": ["Candidate", "Employer"],
        "variables": ["salary", "bonus", "remote_days", "vacation_days"],
        "agents": [
            {
                "id": "candidate",
                "name": "Sarah Mitchell",
                "role": "candidate",
                "persona": "Collaborative",
                "goals": ["Maximize total compensation and benefits"],
                "constraints": {"minimum_price": 95000},
                "variable_weights": {"salary": 0.45, "bonus": 0.25, "remote_days": 0.15, "vacation_days": 0.15},
                "negotiation_objectives": ["Target salary is $105,000", "Minimum $95,000 base salary"]
            },
            {
                "id": "employer",
                "name": "Michael Anderson",
                "role": "employer",
                "persona": "Risk-averse",
                "goals": ["Secure the candidate within approved budget"],
                "constraints": {"maximum_price": 110000},
                "variable_weights": {"salary": 0.45, "bonus": 0.20, "remote_days": 0.15, "vacation_days": 0.20},
                "negotiation_objectives": ["Target salary is $98,000", "Maximum $110,000 budget limit"]
            }
        ]
    },
    "project_budget": {
        "scenario_id": "project_budget",
        "scenario_name": "Project Budget Allocation",
        "category": "Project Management",
        "description": "Department Head and Finance Manager negotiate how much budget to allocate to a new initiative.",
        "participants": ["Department Head", "Finance Manager"],
        "variables": ["budget", "scope", "deadline_weeks", "milestones"],
        "agents": [
            {
                "id": "department_head",
                "name": "Olivia Bennett",
                "role": "department_head",
                "persona": "Aggressive",
                "goals": ["Secure maximum budget for the initiative"],
                "constraints": {"minimum_price": 75000},
                "variable_weights": {"budget": 0.45, "scope": 0.25, "deadline_weeks": 0.15, "milestones": 0.15},
                "negotiation_objectives": ["Target allocation is $95,000", "Minimum $75,000 allocation"]
            },
            {
                "id": "finance_director",
                "name": "James Wilson",
                "role": "finance_director",
                "persona": "Collaborative",
                "goals": ["Control company-wide spending"],
                "constraints": {"maximum_price": 85000},
                "variable_weights": {"budget": 0.45, "scope": 0.20, "deadline_weeks": 0.20, "milestones": 0.15},
                "negotiation_objectives": ["Target allocation is $70,000", "Maximum $85,000 allocation"]
            }
        ]
    },
    "real_estate": {
        "scenario_id": "real_estate",
        "scenario_name": "Real Estate Price Negotiation",
        "category": "Real Estate",
        "description": "Buyer and Seller negotiate property purchase price, closing timeline, deposit, included items, and repair credits.",
        "participants": ["Buyer", "Seller"],
        "variables": ["property_price", "closing_date", "deposit", "included_items", "repairs"],
        "agents": [
            {
                "id": "buyer",
                "name": "Alex Vance",
                "role": "buyer",
                "persona": "Risk-averse",
                "goals": ["Secure property within max home loan pre-approval"],
                "constraints": {"maximum_price": 450000},
                "negotiation_objectives": ["Target price is $420,000", "Maximum $450,000 budget limit"]
            },
            {
                "id": "seller",
                "name": "Elena Rostova",
                "role": "seller",
                "persona": "Aggressive",
                "goals": ["Maximize net proceeds from property sale"],
                "constraints": {"minimum_price": 410000},
                "negotiation_objectives": ["Target price is $445,000", "Minimum $410,000 floor price"]
            }
        ]
    },
    "car_purchase": {
        "scenario_id": "car_purchase",
        "scenario_name": "Car Purchase Negotiation",
        "category": "Consumer",
        "description": "Customer and dealership representative negotiate vehicle out-the-door price, down payment, extended warranty, accessories, and trade-in value.",
        "participants": ["Customer", "Dealer"],
        "variables": ["vehicle_price", "down_payment", "warranty", "accessories", "trade_in_value"],
        "agents": [
            {
                "id": "customer",
                "name": "David Miller",
                "role": "customer",
                "persona": "Collaborative",
                "goals": ["Get fair pricing with free accessories"],
                "constraints": {"maximum_price": 32000},
                "negotiation_objectives": ["Target price is $28,500", "Maximum $32,000 budget limit"]
            },
            {
                "id": "dealer",
                "name": "Marcus Vance",
                "role": "dealer",
                "persona": "Aggressive",
                "goals": ["Protect dealer commission and margin"],
                "constraints": {"minimum_price": 27500},
                "negotiation_objectives": ["Target price is $31,000", "Minimum $27,500 selling floor"]
            }
        ]
    },
    "freelance_contract": {
        "scenario_id": "freelance_contract",
        "scenario_name": "Freelance Contract Negotiation",
        "category": "Freelancing",
        "description": "Freelance developer/designer and client negotiate project scope, fixed project fee, delivery deadline, payment schedule, and revision rounds.",
        "participants": ["Freelancer", "Client"],
        "variables": ["project_fee", "deadline", "scope", "payment_schedule", "revisions"],
        "agents": [
            {
                "id": "freelancer",
                "name": "Maya Lin",
                "role": "freelancer",
                "persona": "Collaborative",
                "goals": ["Fair rate for project complexity and tight deadline"],
                "constraints": {"minimum_price": 8500},
                "negotiation_objectives": ["Target fee is $11,000", "Minimum $8,500 project floor"]
            },
            {
                "id": "client",
                "name": "Jonathan Reed",
                "role": "client",
                "persona": "Risk-averse",
                "goals": ["Deliver project within startup launch budget"],
                "constraints": {"maximum_price": 12000},
                "negotiation_objectives": ["Target fee is $9,000", "Maximum $12,000 budget cap"]
            }
        ]
    },
    "supplier_contract": {
        "scenario_id": "supplier_contract",
        "scenario_name": "Supplier Contract Negotiation",
        "category": "Supply Chain",
        "description": "Procurement Manager and raw materials supplier negotiate unit pricing, annual volume quantity, delivery schedules, payment terms, and multi-year contract duration.",
        "participants": ["Procurement Manager", "Supplier"],
        "variables": ["unit_price", "quantity", "delivery_time", "payment_terms", "contract_duration"],
        "agents": [
            {
                "id": "procurement_manager",
                "name": "Robert Chen",
                "role": "procurement_manager",
                "persona": "Risk-averse",
                "goals": ["Reduce raw material cost per unit for manufacturing"],
                "constraints": {"maximum_price": 140000},
                "negotiation_objectives": ["Target cost is $120,000", "Maximum $140,000 annual budget"]
            },
            {
                "id": "supplier",
                "name": "Viktor Sterling",
                "role": "supplier",
                "persona": "Aggressive",
                "goals": ["Lock in high volume order with healthy wholesale margin"],
                "constraints": {"minimum_price": 115000},
                "negotiation_objectives": ["Target cost is $135,000", "Minimum $115,000 price floor"]
            }
        ]
    },
    "salary_benefits": {
        "scenario_id": "salary_benefits",
        "scenario_name": "Salary & Benefits Negotiation",
        "category": "Employment",
        "description": "Executive candidate and VP of HR negotiate base salary, sign-on bonus, annual performance bonus, remote work days, and vacation allowance.",
        "participants": ["Candidate", "Employer"],
        "variables": ["base_salary", "bonus", "joining_date", "remote_work", "benefits", "vacation"],
        "agents": [
            {
                "id": "candidate",
                "name": "Rachel Adams",
                "role": "candidate",
                "persona": "Aggressive",
                "goals": ["Market-leading executive compensation package"],
                "constraints": {"minimum_price": 130000},
                "negotiation_objectives": ["Target salary is $150,000", "Minimum $130,000 base compensation"]
            },
            {
                "id": "employer",
                "name": "Thomas Wright",
                "role": "employer",
                "persona": "Collaborative",
                "goals": ["Attract top talent without destabilizing team pay bands"],
                "constraints": {"maximum_price": 155000},
                "negotiation_objectives": ["Target salary is $138,000", "Maximum $155,000 pay band limit"]
            }
        ]
    },
    "project_deadline": {
        "scenario_id": "project_deadline",
        "scenario_name": "Project Deadline Negotiation",
        "category": "Project Management",
        "description": "Project Lead and Enterprise Client negotiate realistic delivery milestones, team resource allocation, feature scope, and expediting budget bonuses.",
        "participants": ["Project Manager", "Client"],
        "variables": ["delivery_date", "project_scope", "resources", "budget", "milestones"],
        "agents": [
            {
                "id": "project_manager",
                "name": "Chris Taylor",
                "role": "project_manager",
                "persona": "Risk-averse",
                "goals": ["Ensure sufficient development sprint time to prevent burnout"],
                "constraints": {"minimum_price": 60000},
                "negotiation_objectives": ["Target budget is $80,000", "Minimum $60,000 resource allocation"]
            },
            {
                "id": "client",
                "name": "Amanda Foster",
                "role": "client",
                "persona": "Aggressive",
                "goals": ["Accelerate go-to-market date for Q3 product launch"],
                "constraints": {"maximum_price": 85000},
                "negotiation_objectives": ["Target budget is $70,000", "Maximum $85,000 total budget"]
            }
        ]
    },
    "rent_negotiation": {
        "scenario_id": "rent_negotiation",
        "scenario_name": "Rent Negotiation",
        "category": "Housing",
        "description": "Prospective tenant and property landlord negotiate monthly rent rate, security deposit amount, 12 vs 24 month lease term, included utilities, and move-in date.",
        "participants": ["Tenant", "Landlord"],
        "variables": ["monthly_rent", "security_deposit", "lease_duration", "maintenance", "move_in_date"],
        "agents": [
            {
                "id": "tenant",
                "name": "Jordan Lee",
                "role": "tenant",
                "persona": "Collaborative",
                "goals": ["Affordable long-term lease in a quiet residential building"],
                "constraints": {"maximum_price": 2600},
                "negotiation_objectives": ["Target rent is $2,350/mo", "Maximum $2,600 monthly rent"]
            },
            {
                "id": "landlord",
                "name": "Arthur Pendelton",
                "role": "landlord",
                "persona": "Aggressive",
                "goals": ["Maximize rental yield and secure stable multi-year tenant"],
                "constraints": {"minimum_price": 2300},
                "negotiation_objectives": ["Target rent is $2,550/mo", "Minimum $2,300 monthly floor"]
            }
        ]
    },
    "business_partnership": {
        "scenario_id": "business_partnership",
        "scenario_name": "Business Partnership Negotiation",
        "category": "Business",
        "description": "Startup Founder and Angel Investor negotiate seed investment capital, equity percentage, revenue sharing terms, operational responsibilities, and contract duration.",
        "participants": ["Startup Founder", "Business Partner/Investor"],
        "variables": ["investment_amount", "equity_percentage", "revenue_sharing", "responsibilities", "contract_duration"],
        "agents": [
            {
                "id": "founder",
                "name": "Sophia Martinez",
                "role": "founder",
                "persona": "Aggressive",
                "goals": ["Raise maximum growth capital while preserving founder control"],
                "constraints": {"minimum_price": 250000},
                "negotiation_objectives": ["Target capital is $350,000", "Minimum $250,000 valuation floor"]
            },
            {
                "id": "investor",
                "name": "Harrison Vance",
                "role": "investor",
                "persona": "Risk-averse",
                "goals": ["Secure meaningful equity stake and governance rights"],
                "constraints": {"maximum_price": 400000},
                "negotiation_objectives": ["Target capital is $300,000", "Maximum $400,000 investment cap"]
            }
        ]
    },
    "service_contract": {
        "scenario_id": "service_contract",
        "scenario_name": "Service Contract Negotiation",
        "category": "Services",
        "description": "Corporate Client and IT Service Provider negotiate monthly service retainer fees, SLA uptime guarantees, support levels, and annual renewal escalation terms.",
        "participants": ["Customer", "Service Provider"],
        "variables": ["service_price", "contract_duration", "support_level", "sla", "renewal_terms"],
        "agents": [
            {
                "id": "customer",
                "name": "Kevin Patel",
                "role": "customer",
                "persona": "Risk-averse",
                "goals": ["Strict 99.99% SLA uptime guarantee within IT operating budget"],
                "constraints": {"maximum_price": 15000},
                "negotiation_objectives": ["Target fee is $12,000/mo", "Maximum $15,000 monthly budget"]
            },
            {
                "id": "service_provider",
                "name": "Siddharth Nair",
                "role": "service_provider",
                "persona": "Collaborative",
                "goals": ["Cover high 24/7 engineering team coverage overhead"],
                "constraints": {"minimum_price": 11000},
                "negotiation_objectives": ["Target fee is $14,000/mo", "Minimum $11,000 fee floor"]
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
        else:
            db_agent.name = default_agent["name"]
            db_agent.role = default_agent["role"]
            db.commit()
            db.refresh(db_agent)
        agents.append(db_agent.to_dict())
    return agents

def create_negotiation_session(
    db: Session,
    scenario_id: str = "vendor_pricing",
    agent_profiles: Optional[List[Dict[str, Any]]] = None,
    max_rounds: int = 5,
    mode: str = "simulation",
    human_role: Optional[str] = None,
    user_id: Optional[str] = None,
    difficulty: Optional[str] = "Intermediate"
) -> NegotiationOrchestrator:
    negotiation_id = str(uuid.uuid4())

    if not agent_profiles:
        if scenario_id in DEFAULT_SCENARIOS:
            agent_profiles = DEFAULT_SCENARIOS[scenario_id]["agents"]
        else:
            custom_scen = db.query(CustomScenarioModel).filter(CustomScenarioModel.id == scenario_id).first()
            if custom_scen:
                agent_profiles = custom_scen.agents
                if custom_scen.max_rounds and max_rounds == 5:
                    max_rounds = custom_scen.max_rounds
            else:
                agent_profiles = get_or_create_default_agents(db)

    # Save initial negotiation state to DB
    initial_turn = agent_profiles[0]["id"] if agent_profiles else "buyer"
    db_neg = NegotiationModel(
        negotiation_id=negotiation_id,
        user_id=user_id,
        scenario_id=scenario_id,
        mode=mode,
        human_role=human_role,
        difficulty=difficulty or "Intermediate",
        current_round=0,
        max_rounds=max_rounds,
        current_agent_turn=initial_turn,
        status="active"
    )

    db_neg.participating_agents = agent_profiles
    db_neg.current_offer = None
    db_neg.previous_offer = None
    db_neg.deadlock_info = {}

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
        mode=mode,
        human_role=human_role,
        user_id=user_id,
        difficulty=difficulty or "Intermediate",
        current_offer=None,
        previous_offer=None,
        history=[],
        deadlock_info={}
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
        mode=getattr(db_neg, "mode", "simulation") or "simulation",
        human_role=getattr(db_neg, "human_role", None),
        user_id=getattr(db_neg, "user_id", None),
        difficulty=getattr(db_neg, "difficulty", "Intermediate") or "Intermediate",
        current_offer=db_neg.current_offer,
        previous_offer=db_neg.previous_offer,
        history=history,
        deadlock_info=getattr(db_neg, "deadlock_info", {}) or {}
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
    db_neg.mode = orch.mode
    db_neg.human_role = orch.human_role
    db_neg.difficulty = getattr(orch, "difficulty", "Intermediate")
    db_neg.deadlock_info = orch.deadlock_info
    db_neg.live_metrics = orch.get_live_metrics()

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
