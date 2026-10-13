from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator

class ParticipantSchema(BaseModel):
    name: str = Field(..., min_length=1, description="Participant name")
    role: str = Field(..., min_length=1, description="Participant role title")
    personality: str = Field("Collaborative", description="Aggressive, Collaborative, or Risk-Averse")
    objective: str = Field(..., min_length=1, description="Primary negotiation objective")
    secondary_objective: Optional[str] = Field(None, description="Secondary objective")
    min_value: Optional[float] = Field(None, description="Minimum acceptable value")
    max_value: Optional[float] = Field(None, description="Maximum acceptable value")

    @field_validator("personality")
    @classmethod
    def validate_personality(cls, v: str) -> str:
        v_clean = v.strip().title()
        if v_clean not in ["Aggressive", "Collaborative", "Risk-Averse", "Risk-averse"]:
            return "Collaborative"
        return "Risk-Averse" if v_clean == "Risk-Averse" else v_clean

class VariableSchema(BaseModel):
    name: str = Field(..., min_length=1, description="Variable name (e.g., Price)")
    type: str = Field("Currency", description="Number, Currency, Percentage, Date, or Text")
    starting_value: Optional[Any] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    importance: Optional[str] = "High"

class CustomScenarioCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Scenario title")
    category: str = Field("Business", description="Category")
    description: str = Field(..., min_length=5, description="Scenario description")
    participants: List[ParticipantSchema] = Field(..., min_length=2, description="At least 2 participants required")
    variables: Optional[List[VariableSchema]] = Field(default_factory=list)
    objectives: Optional[Dict[str, Any]] = Field(default_factory=dict)
    constraints: Optional[Dict[str, Any]] = Field(default_factory=dict)
    max_rounds: int = Field(10, ge=1, le=50, description="Max rounds must be > 0")
    mode: str = Field("simulation", description="simulation or practice")

    @field_validator("participants")
    @classmethod
    def validate_participants_list(cls, participants: List[ParticipantSchema]) -> List[ParticipantSchema]:
        if len(participants) < 2:
            raise ValueError("A negotiation scenario requires at least 2 participants.")
        for p in participants:
            if p.min_value is not None and p.max_value is not None:
                if p.min_value > p.max_value:
                    raise ValueError(f"Participant '{p.name}' has minimum acceptable value ({p.min_value}) greater than maximum ({p.max_value}).")
        return participants

class CustomScenarioUpdateRequest(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    participants: Optional[List[ParticipantSchema]] = None
    variables: Optional[List[VariableSchema]] = None
    objectives: Optional[Dict[str, Any]] = None
    constraints: Optional[Dict[str, Any]] = None
    max_rounds: Optional[int] = None
    mode: Optional[str] = None

class CustomScenarioResponse(BaseModel):
    id: str
    scenario_id: str
    name: str
    title: str
    category: str
    description: str
    participants: List[Any]
    variables: List[Any]
    objectives: Dict[str, Any]
    constraints: Dict[str, Any]
    agents: List[Any]
    max_rounds: int
    mode: str
    is_custom: bool = True
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
