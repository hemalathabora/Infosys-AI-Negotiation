from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, Field
from app.schemas.agent import AgentProfileResponse
from app.schemas.response import LLMStructuredResponse

class OfferLog(BaseModel):
    agent_id: str
    round: int
    decision: str
    proposed_offer: Optional[Union[Dict[str, Any], float, int]] = None
    value: Optional[float] = None
    reasoning: str
    parameters: Optional[Dict[str, Any]] = None
    timestamp: str

class NegotiationCreate(BaseModel):
    scenario_id: Optional[str] = "vendor_pricing"
    scenario_name: Optional[str] = "Vendor Pricing Negotiation"
    description: Optional[str] = None
    agents: Optional[List[AgentProfileResponse]] = None
    agent_ids: Optional[List[str]] = None
    max_rounds: Optional[int] = 8

class NegotiationStateResponse(BaseModel):
    negotiation_id: str
    scenario_id: str
    current_round: int
    max_rounds: int
    current_agent_turn: Optional[str] = None
    status: str # "active" | "accepted" | "rejected" | "completed" | "cancelled" | "in_progress" | "agreement" | "deadlock"
    previous_offer: Optional[Dict[str, Any]] = None
    current_offer: Optional[Dict[str, Any]] = None
    participating_agents: List[AgentProfileResponse]
    history: List[OfferLog] = Field(default_factory=list)

class TurnResponse(BaseModel):
    negotiation_id: str
    round: int
    current_agent_id: str
    decision: str
    offer: Optional[Union[Dict[str, Any], float]] = None
    reasoning: str
    status: str
    next_agent_id: Optional[str] = None
    llm_response: LLMStructuredResponse
