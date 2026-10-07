from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from app.schemas.agent import AgentProfileResponse
from app.schemas.response import LLMStructuredResponse
from app.schemas.tradeoff import VariableDefinition

class OfferLog(BaseModel):
    agent_id: str
    round: int
    decision: str
    proposed_offer: Optional[Union[Dict[str, Any], float, int]] = None
    value: Optional[float] = None
    reasoning: str
    parameters: Optional[Dict[str, Any]] = None
    timestamp: str
    concession_data: Optional[Dict[str, Any]] = None
    tradeoff_data: Optional[Dict[str, Any]] = None
    utility_data: Optional[Dict[str, Any]] = None
    strategy_feedback: Optional[str] = None

class NegotiationCreate(BaseModel):
    scenario_id: Optional[str] = "vendor_pricing"
    scenario_name: Optional[str] = "Vendor Pricing Negotiation"
    description: Optional[str] = None
    agents: Optional[List[AgentProfileResponse]] = None
    agent_ids: Optional[List[str]] = None
    max_rounds: Optional[int] = 5
    mode: Optional[str] = "simulation"  # "simulation" | "practice"
    human_role: Optional[str] = None
    user_id: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"  # Beginner | Intermediate | Advanced | Expert
    ai_personality: Optional[str] = None  # Aggressive | Collaborative | Risk-Averse

class NegotiationStateResponse(BaseModel):
    negotiation_id: str
    scenario_id: str
    current_round: int
    max_rounds: int
    current_agent_turn: Optional[str] = None
    status: str  # "active" | "accepted" | "rejected" | "completed" | "cancelled" | "in_progress" | "agreement" | "deadlock" | "breakdown"
    mode: Optional[str] = "simulation"
    human_role: Optional[str] = None
    user_id: Optional[str] = None
    difficulty: Optional[str] = "Intermediate"
    previous_offer: Optional[Dict[str, Any]] = None
    current_offer: Optional[Dict[str, Any]] = None
    participating_agents: List[AgentProfileResponse]
    history: List[OfferLog] = Field(default_factory=list)
    deadlock_info: Optional[Dict[str, Any]] = None
    variables: Optional[Dict[str, Any]] = None
    live_metrics: Optional[Dict[str, Any]] = None
    execution_mode: Optional[str] = "Normal Mode"

class NegotiationSummary(BaseModel):
    negotiation_id: str
    scenario_id: str
    scenario_name: str
    mode: str
    status: str
    current_round: int
    max_rounds: int
    agents_summary: str
    created_at: Optional[str] = None
    user_id: Optional[str] = None

class PracticeTurnRequest(BaseModel):
    participant_id: Optional[str] = "human"
    offer: Dict[str, Any]  # e.g., {"price": 44000, "delivery_days": 20} or {"variables": {...}}
    message: Optional[str] = None
    decision: Optional[str] = "counter"  # "counter" | "offer" | "accept" | "reject"

class TurnResponse(BaseModel):
    negotiation_id: str
    round: int
    current_agent_id: str
    decision: str
    offer: Optional[Union[Dict[str, Any], float]] = None
    reasoning: str
    status: str
    next_agent_id: Optional[str] = None
    llm_response: Optional[LLMStructuredResponse] = None
    tradeoff: Optional[Dict[str, Any]] = None

class ParseMessageRequest(BaseModel):
    message: str
    scenario_id: Optional[str] = "vendor_pricing"

class ParseMessageResponse(BaseModel):
    success: bool
    parsed_offer: Dict[str, Any]
    detected_variables: Dict[str, Any]
    confidence: float
    message: str

class HintResponse(BaseModel):
    hint: str
    tactical_advice: str
    recommended_package: Optional[Dict[str, Any]] = None
    opponent_flexibility: str
    zopa_status: str

class NegotiationScorecard(BaseModel):
    overall_score: float  # 0 to 100
    objective_achievement: float
    utility_score: float
    tradeoff_quality: float
    constraint_discipline: float
    efficiency: float
    total_rounds: int
    tradeoffs_detected: int
    concessions_made: int
    outcome: str
    coaching_summary: str
