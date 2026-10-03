import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.custom_scenario import CustomScenarioModel
from app.schemas.custom_scenario import (
    CustomScenarioCreateRequest,
    CustomScenarioUpdateRequest,
    CustomScenarioResponse
)
from app.services.negotiation_service import create_negotiation_session
from app.services.auth_service import extract_token_from_header, decode_access_token

router = APIRouter(prefix="/api/custom-scenarios", tags=["Custom Scenarios"])

def get_current_user_id_optional(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    token = extract_token_from_header(authorization)
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    return payload.get("sub") or payload.get("email") or payload.get("id")

def build_agents_from_participants(participants, name_prefix="Scenario"):
    agents = []
    for idx, p in enumerate(participants):
        p_dict = p.model_dump() if hasattr(p, "model_dump") else p
        p_name = p_dict.get("name", f"Participant {idx+1}")
        p_role = p_dict.get("role", f"Role {idx+1}")
        role_id = p_role.lower().replace(" ", "_").replace("/", "_")
        if not role_id:
            role_id = f"agent_{idx+1}"

        persona = p_dict.get("personality", "Collaborative")
        obj = p_dict.get("objective", "Achieve target agreement")
        sec_obj = p_dict.get("secondary_objective")

        constraints_dict = {}
        min_val = p_dict.get("min_value")
        max_val = p_dict.get("max_value")

        if max_val is not None:
            constraints_dict["maximum_price"] = float(max_val)
        if min_val is not None:
            constraints_dict["minimum_price"] = float(min_val)

        obj_list = [f"Primary: {obj}"]
        if sec_obj:
            obj_list.append(f"Secondary: {sec_obj}")
        if max_val is not None:
            obj_list.append(f"Maximum limit boundary: ${max_val:,.2f}")
        if min_val is not None:
            obj_list.append(f"Minimum floor boundary: ${min_val:,.2f}")

        agents.append({
            "id": role_id,
            "name": p_name,
            "role": p_role,
            "persona": persona,
            "personality": persona,
            "goals": [obj],
            "constraints": constraints_dict,
            "negotiation_objectives": obj_list
        })
    return agents

@router.get("", response_model=List[CustomScenarioResponse])
def list_custom_scenarios(
    user_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    auth_user_id: Optional[str] = Depends(get_current_user_id_optional)
):
    target_user_id = auth_user_id or user_id
    query = db.query(CustomScenarioModel)
    if target_user_id:
        # Include user's scenarios plus shared/anonymous scenarios
        query = query.filter((CustomScenarioModel.user_id == target_user_id) | (CustomScenarioModel.user_id == None))
    scenarios = query.order_by(CustomScenarioModel.created_at.desc()).all()
    return [s.to_dict() for s in scenarios]

@router.post("", response_model=CustomScenarioResponse, status_code=201)
def create_custom_scenario(
    payload: CustomScenarioCreateRequest,
    db: Session = Depends(get_db),
    auth_user_id: Optional[str] = Depends(get_current_user_id_optional)
):
    scen_id = f"custom_{str(uuid.uuid4())[:8]}"
    agents = build_agents_from_participants(payload.participants, payload.name)

    scen = CustomScenarioModel(
        id=scen_id,
        user_id=auth_user_id,
        name=payload.name,
        category=payload.category,
        description=payload.description,
        max_rounds=payload.max_rounds,
        mode=payload.mode
    )
    scen.participants = [p.model_dump() for p in payload.participants]
    scen.variables = [v.model_dump() for v in (payload.variables or [])]
    scen.objectives = payload.objectives or {}
    scen.constraints = payload.constraints or {}
    scen.agents = agents

    db.add(scen)
    db.commit()
    db.refresh(scen)
    return scen.to_dict()

@router.get("/{scenario_id}", response_model=CustomScenarioResponse)
def get_custom_scenario(
    scenario_id: str,
    db: Session = Depends(get_db)
):
    scen = db.query(CustomScenarioModel).filter(CustomScenarioModel.id == scenario_id).first()
    if not scen:
        raise HTTPException(status_code=404, detail=f"Custom scenario '{scenario_id}' not found.")
    return scen.to_dict()

@router.put("/{scenario_id}", response_model=CustomScenarioResponse)
def update_custom_scenario(
    scenario_id: str,
    payload: CustomScenarioUpdateRequest,
    db: Session = Depends(get_db),
    auth_user_id: Optional[str] = Depends(get_current_user_id_optional)
):
    scen = db.query(CustomScenarioModel).filter(CustomScenarioModel.id == scenario_id).first()
    if not scen:
        raise HTTPException(status_code=404, detail=f"Custom scenario '{scenario_id}' not found.")

    if scen.user_id and auth_user_id and scen.user_id != auth_user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to modify this scenario.")

    if payload.name is not None:
        scen.name = payload.name
    if payload.category is not None:
        scen.category = payload.category
    if payload.description is not None:
        scen.description = payload.description
    if payload.max_rounds is not None:
        scen.max_rounds = payload.max_rounds
    if payload.mode is not None:
        scen.mode = payload.mode
    if payload.participants is not None:
        scen.participants = [p.model_dump() for p in payload.participants]
        scen.agents = build_agents_from_participants(payload.participants, scen.name)
    if payload.variables is not None:
        scen.variables = [v.model_dump() for v in payload.variables]
    if payload.objectives is not None:
        scen.objectives = payload.objectives
    if payload.constraints is not None:
        scen.constraints = payload.constraints

    db.commit()
    db.refresh(scen)
    return scen.to_dict()

@router.post("/{scenario_id}/duplicate", response_model=CustomScenarioResponse, status_code=201)
def duplicate_custom_scenario(
    scenario_id: str,
    db: Session = Depends(get_db),
    auth_user_id: Optional[str] = Depends(get_current_user_id_optional)
):
    scen = db.query(CustomScenarioModel).filter(CustomScenarioModel.id == scenario_id).first()
    if not scen:
        raise HTTPException(status_code=404, detail=f"Custom scenario '{scenario_id}' not found.")

    new_id = f"custom_{str(uuid.uuid4())[:8]}"
    dup = CustomScenarioModel(
        id=new_id,
        user_id=auth_user_id or scen.user_id,
        name=f"{scen.name} (Copy)",
        category=scen.category,
        description=scen.description,
        max_rounds=scen.max_rounds,
        mode=scen.mode
    )
    dup.participants = scen.participants
    dup.variables = scen.variables
    dup.objectives = scen.objectives
    dup.constraints = scen.constraints
    dup.agents = scen.agents

    db.add(dup)
    db.commit()
    db.refresh(dup)
    return dup.to_dict()

@router.delete("/{scenario_id}")
def delete_custom_scenario(
    scenario_id: str,
    db: Session = Depends(get_db),
    auth_user_id: Optional[str] = Depends(get_current_user_id_optional)
):
    scen = db.query(CustomScenarioModel).filter(CustomScenarioModel.id == scenario_id).first()
    if not scen:
        raise HTTPException(status_code=404, detail=f"Custom scenario '{scenario_id}' not found.")

    if scen.user_id and auth_user_id and scen.user_id != auth_user_id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this scenario.")

    db.delete(scen)
    db.commit()
    return {"success": True, "message": f"Custom scenario '{scenario_id}' deleted successfully."}

@router.post("/{scenario_id}/start")
def start_custom_scenario_negotiation(
    scenario_id: str,
    mode: Optional[str] = Query("simulation"),
    human_role: Optional[str] = Query(None),
    max_rounds: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    auth_user_id: Optional[str] = Depends(get_current_user_id_optional)
):
    scen = db.query(CustomScenarioModel).filter(CustomScenarioModel.id == scenario_id).first()
    if not scen:
        raise HTTPException(status_code=404, detail=f"Custom scenario '{scenario_id}' not found.")

    rounds_to_use = max_rounds or scen.max_rounds or 10
    orch = create_negotiation_session(
        db=db,
        scenario_id=scen.id,
        agent_profiles=scen.agents,
        max_rounds=rounds_to_use,
        mode=mode or scen.mode or "simulation",
        human_role=human_role,
        user_id=auth_user_id
    )

    return {
        "success": True,
        "negotiation_id": orch.negotiation_id,
        "scenario_id": scen.id,
        "scenario_name": scen.name,
        "status": orch.status,
        "state": orch.get_state_dict()
    }
