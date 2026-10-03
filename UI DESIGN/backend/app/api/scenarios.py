from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.negotiation_service import DEFAULT_SCENARIOS
from app.models.custom_scenario import CustomScenarioModel

router = APIRouter(prefix="/api/scenarios", tags=["Scenarios"])

@router.get("", response_model=List[Dict[str, Any]])
def list_scenarios(db: Session = Depends(get_db)):
    """List preset scenarios plus custom scenarios."""
    preset = list(DEFAULT_SCENARIOS.values())
    custom_records = db.query(CustomScenarioModel).all()
    custom_list = [c.to_scenario_config() for c in custom_records]
    return preset + custom_list

@router.get("/{scenario_id}")
def get_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Get scenario details by ID."""
    scen = DEFAULT_SCENARIOS.get(scenario_id)
    if scen:
        return scen
    custom_scen = db.query(CustomScenarioModel).filter(CustomScenarioModel.id == scenario_id).first()
    if custom_scen:
        return custom_scen.to_scenario_config()
    return {"scenario_id": scenario_id, "name": scenario_id, "agents": []}
