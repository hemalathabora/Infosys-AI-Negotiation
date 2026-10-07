from typing import Dict, Any, List, Optional, Union
from pydantic import BaseModel, Field

class VariableDefinition(BaseModel):
    name: str
    display_name: str
    type: str = "number"  # "number" | "integer" | "boolean" | "select"
    unit: Optional[str] = None
    min_value: float = 0.0
    max_value: float = 100.0
    preferred_value: Optional[float] = None
    importance: float = Field(default=0.5, ge=0.0, le=1.0)
    direction: str = "lower_is_better"  # "lower_is_better" | "higher_is_better"
    negotiable: bool = True
    weight: float = Field(default=0.25, ge=0.0, le=1.0)
    hard: bool = False
    hard_min: Optional[float] = None
    hard_max: Optional[float] = None
    step: Optional[float] = 1.0

class MultiVariableOffer(BaseModel):
    variables: Dict[str, Any] = Field(default_factory=dict)

    @classmethod
    def from_any_offer(cls, raw_offer: Any) -> "MultiVariableOffer":
        if raw_offer is None:
            return cls(variables={})
        if isinstance(raw_offer, MultiVariableOffer):
            return raw_offer
        if isinstance(raw_offer, dict):
            if "variables" in raw_offer and isinstance(raw_offer["variables"], dict):
                return cls(variables=dict(raw_offer["variables"]))
            # Flat dictionary representation
            vars_dict = {k: v for k, v in raw_offer.items() if k not in ["terms", "parameters", "concession_data", "details"]}
            return cls(variables=vars_dict)
        if isinstance(raw_offer, (int, float)):
            return cls(variables={"price": float(raw_offer)})
        return cls(variables={})

    def get_scalar_price(self) -> Optional[float]:
        for key in ["price", "salary", "budget", "amount", "unit_price", "base_salary", "project_fee", "vehicle_price", "property_price", "monthly_rent", "investment_amount", "service_price"]:
            if key in self.variables:
                try:
                    return float(self.variables[key])
                except (ValueError, TypeError):
                    pass
        for k, v in self.variables.items():
            if isinstance(v, (int, float)):
                return float(v)
        return None

class VariableScore(BaseModel):
    variable: str
    raw_value: Any
    score: float = Field(ge=0.0, le=1.0)
    weight: float = Field(ge=0.0, le=1.0)
    weighted_score: float

class UtilityResult(BaseModel):
    overall_score: float  # Normalized 0.0 to 1.0
    variable_scores: Dict[str, float] = Field(default_factory=dict)
    weighted_contribution: Dict[str, float] = Field(default_factory=dict)
    raw_values: Dict[str, Any] = Field(default_factory=dict)
    violations: List[str] = Field(default_factory=list)
    is_valid: bool = True

class TradeoffChange(BaseModel):
    variable: str
    direction: str  # "improved" | "worsened" | "unchanged"
    previous_value: Optional[Any] = None
    current_value: Optional[Any] = None
    delta: float = 0.0
    utility_delta: float = 0.0

class TradeoffItem(BaseModel):
    variable: str
    change: float
    description: Optional[str] = None

class TradeoffSummary(BaseModel):
    give: List[TradeoffItem] = Field(default_factory=list)
    receive: List[TradeoffItem] = Field(default_factory=list)
    description: Optional[str] = None

class TradeoffDetectionResult(BaseModel):
    tradeoff_detected: bool = False
    changes: List[TradeoffChange] = Field(default_factory=list)
    tradeoff: TradeoffSummary = Field(default_factory=TradeoffSummary)
    net_utility_delta: float = 0.0
    summary: str = ""
    pareto_improvement: Optional[bool] = None

class PackageOffer(BaseModel):
    variables: Dict[str, Any]
    description: str = ""
    give: List[Dict[str, Any]] = Field(default_factory=list)
    receive: List[Dict[str, Any]] = Field(default_factory=list)
    proposer_utility: float = 0.0
