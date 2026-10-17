import re
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.user import User
from app.models.agent import AgentModel
from app.models.negotiation import NegotiationModel
from app.models.message import NegotiationMessageModel
from app.models.custom_scenario import CustomScenarioModel
from app.schemas.negotiation import (
    NegotiationCreate,
    NegotiationStateResponse,
    TurnResponse,
    OfferLog,
    PracticeTurnRequest,
    NegotiationSummary,
    NegotiationHistoryItem,
    NegotiationHistoryListResponse,
    NegotiationDetailResponse,
    ParseMessageRequest,
    ParseMessageResponse,
    HintResponse,
    NegotiationScorecard,
    NegotiationRecordCreate
)
from app.services.auth_service import get_user_from_header
from app.services.export_service import (
    generate_session_csv,
    generate_all_history_csv,
    generate_session_pdf,
    sanitize_session_for_export,
    extract_safe_price
)
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

def get_current_user_required(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to access private negotiation history."
        )
    user = get_user_from_header(db, authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token."
        )
    return user

def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not authorization:
        return None
    return get_user_from_header(db, authorization)

def verify_negotiation_ownership(session: NegotiationModel, user: User):
    """
    Ensures that private negotiation sessions are only accessed by their rightful owner.
    """
    if session.user_id:
        allowed_ids = {str(user.id), user.email.lower() if user.email else ""}
        actual_id = str(session.user_id).lower()
        if actual_id not in allowed_ids and str(session.user_id) != str(user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not have permission to view or export this negotiation session."
            )

def get_scenario_meta(scenario_id: str, db: Session) -> Dict[str, Any]:
    if scenario_id in DEFAULT_SCENARIOS:
        scen = DEFAULT_SCENARIOS[scenario_id]
        return {
            "name": scen.get("scenario_name", scenario_id.replace("_", " ").title()),
            "description": scen.get("description", "")
        }
    custom_scen = db.query(CustomScenarioModel).filter(CustomScenarioModel.id == scenario_id).first()
    if custom_scen:
        return {
            "name": custom_scen.title or scenario_id.replace("_", " ").title(),
            "description": custom_scen.description or ""
        }
    return {
        "name": scenario_id.replace("_", " ").title(),
        "description": ""
    }

@router.get("/history", response_model=NegotiationHistoryListResponse)
def get_user_negotiation_history(
    search: Optional[str] = None,
    mode: Optional[str] = None,
    outcome: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    sort_by: str = Query("newest", pattern="^(newest|oldest)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    client_ids: Optional[str] = None,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """
    Retrieves saved negotiation sessions belonging to the authenticated user.
    Supports search, multi-variable filtering, sorting, pagination, and claiming local client sessions.
    """
    if client_ids and client_ids.strip():
        c_list = [c.strip() for c in client_ids.split(",") if c.strip()]
        if c_list:
            db.query(NegotiationModel).filter(
                NegotiationModel.negotiation_id.in_(c_list),
                or_(NegotiationModel.user_id.is_(None), NegotiationModel.user_id == "local-guest")
            ).update({"user_id": str(current_user.id)}, synchronize_session=False)
            db.commit()

    user_identifiers = [str(current_user.id), current_user.email]
    if getattr(current_user, "username", None):
        user_identifiers.append(current_user.username)
    query = db.query(NegotiationModel).filter(NegotiationModel.user_id.in_(user_identifiers))

    if search and search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.filter(NegotiationModel.scenario_id.ilike(term))

    if mode and mode.strip() and mode.lower() != "all":
        query = query.filter(NegotiationModel.mode.ilike(f"%{mode.strip()}%"))

    if outcome and outcome.strip() and outcome.lower() != "all":
        outcome_clean = outcome.strip().lower()
        if outcome_clean == "agreement":
            query = query.filter(NegotiationModel.status.in_(["accepted", "agreement", "completed"]))
        elif outcome_clean == "deadlock":
            query = query.filter(NegotiationModel.status.in_(["deadlock", "rejected", "breakdown"]))
        elif outcome_clean == "in_progress":
            query = query.filter(NegotiationModel.status.in_(["active", "in_progress"]))

    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date.strip())
            query = query.filter(NegotiationModel.created_at >= start_dt)
        except ValueError:
            pass

    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date.strip())
            query = query.filter(NegotiationModel.created_at <= end_dt)
        except ValueError:
            pass

    if sort_by == "oldest":
        query = query.order_by(NegotiationModel.created_at.asc())
    else:
        query = query.order_by(NegotiationModel.created_at.desc())

    total_count = query.count()
    total_pages = max(1, (total_count + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    records = query.offset(offset).limit(page_size).all()

    items = []
    for r in records:
        agents = r.participating_agents or []
        roles = [a.get("role") or a.get("id", "agent") for a in agents if isinstance(a, dict)]
        agents_names = [a.get("name") or a.get("id", "Agent") for a in agents if isinstance(a, dict)]
        agents_str = " vs ".join(agents_names) if agents_names else "Agents"

        meta = get_scenario_meta(r.scenario_id, db)
        scen_name = meta["name"]

        # Check if agreement reached to extract final agreed terms
        status_clean = (r.status or "").lower()
        is_agreed = status_clean in ("accepted", "agreement", "completed")
        curr_offer = r.current_offer if is_agreed else None
        final_price = extract_safe_price(curr_offer) if is_agreed else None

        reasoning_mode = "Normal Mode"
        if r.metrics_json and "reasoning_engine" in r.metrics_json:
            reasoning_mode = "LLM Mode"

        items.append(NegotiationHistoryItem(
            negotiation_id=r.negotiation_id,
            scenario_id=r.scenario_id,
            scenario_name=scen_name,
            mode=r.mode or "simulation",
            reasoning_mode=reasoning_mode,
            status=r.status,
            current_round=r.current_round,
            max_rounds=r.max_rounds,
            participant_roles=roles,
            agents_summary=agents_str,
            final_agreed_terms=curr_offer,
            final_price=final_price,
            created_at=r.created_at.isoformat() if r.created_at else None,
            updated_at=r.updated_at.isoformat() if r.updated_at else None,
            user_id=r.user_id
        ))

    return NegotiationHistoryListResponse(
        items=items,
        total=total_count,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/history/export")
def export_all_negotiation_history(
    format: str = Query("csv", pattern="^(csv|json|pdf)$"),
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """
    Exports all negotiation history records belonging to the authenticated user.
    Supports CSV and JSON exports (and multi-session PDF report).
    """
    fmt = format.lower().strip()
    if fmt not in ["csv", "json", "pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported export format. Supported formats are: csv, json, pdf."
        )

    user_identifiers = [str(current_user.id), current_user.email]
    records = db.query(NegotiationModel).filter(
        NegotiationModel.user_id.in_(user_identifiers)
    ).order_by(NegotiationModel.created_at.desc()).all()

    sessions_with_messages = []
    for r in records:
        meta = get_scenario_meta(r.scenario_id, db)
        msgs = db.query(NegotiationMessageModel).filter(
            NegotiationMessageModel.negotiation_id == r.negotiation_id
        ).order_by(NegotiationMessageModel.id.asc()).all()

        session_dict = {
            "negotiation_id": r.negotiation_id,
            "scenario_id": r.scenario_id,
            "scenario_name": meta["name"],
            "mode": r.mode,
            "status": r.status,
            "current_round": r.current_round,
            "max_rounds": r.max_rounds,
            "participating_agents": r.participating_agents,
            "current_offer": r.current_offer,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        sessions_with_messages.append({
            "session": session_dict,
            "messages": [m.to_dict() for m in msgs]
        })

    date_str = datetime.utcnow().strftime("%Y-%m-%d")

    if fmt == "csv":
        csv_data = generate_all_history_csv(sessions_with_messages)
        filename = f"negomind-history-all-{date_str}.csv"
        return Response(
            content=csv_data,
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    elif fmt == "json":
        clean_data = [
            {
                "session": sanitize_session_for_export(item["session"]),
                "messages": sanitize_session_for_export(item["messages"])
            }
            for item in sessions_with_messages
        ]
        filename = f"negomind-history-all-{date_str}.json"
        return Response(
            content=json.dumps(clean_data, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        # PDF combined export
        if not sessions_with_messages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No negotiation sessions available to export as PDF."
            )
        # Generate combined report using first session as base and compiling summary
        primary = sessions_with_messages[0]
        pdf_bytes = generate_session_pdf(
            primary["session"],
            primary["messages"],
            primary["session"].get("participating_agents", [])
        )
        filename = f"negomind-history-all-{date_str}.pdf"
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )

@router.get("", response_model=List[NegotiationSummary])
def list_negotiations(
    user_id: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Retrieve historical negotiation sessions for a specific user from database."""
    auth_user = get_current_user_optional(authorization, db)
    effective_user_ids = []
    if auth_user:
        effective_user_ids = [str(auth_user.id), auth_user.email]
        if getattr(auth_user, "username", None):
            effective_user_ids.append(auth_user.username)
    if user_id:
        effective_user_ids.append(user_id)

    if not effective_user_ids:
        records = db.query(NegotiationModel).order_by(NegotiationModel.created_at.desc()).limit(20).all()
    else:
        query = db.query(NegotiationModel).filter(NegotiationModel.user_id.in_(effective_user_ids))
        records = query.order_by(NegotiationModel.created_at.desc()).all()

    summaries = []
    for r in records:
        agents = r.participating_agents
        agents_str = " vs ".join([a.get("name", "Agent") for a in agents]) if agents else "Agents"
        meta = get_scenario_meta(r.scenario_id, db)
        scen_name = meta["name"]
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


@router.post("/record", response_model=NegotiationDetailResponse, status_code=status.HTTP_201_CREATED)
def record_completed_negotiation(
    payload: NegotiationRecordCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Persists a completed negotiation session and its turn history to the database.
    Links the negotiation to the authenticated user if logged in, ensuring it appears
    in their permanent Negotiation History audit log.
    """
    auth_user = get_current_user_optional(authorization, db)
    effective_user_id = str(auth_user.id) if auth_user else (payload.user_id or None)

    import uuid
    neg_id = payload.negotiation_id or str(uuid.uuid4())

    db_neg = db.query(NegotiationModel).filter(NegotiationModel.negotiation_id == neg_id).first()

    if not db_neg:
        db_neg = NegotiationModel(
            negotiation_id=neg_id,
            user_id=effective_user_id,
            scenario_id=payload.scenario_id or "vendor_pricing",
            mode=payload.mode or "simulation",
            human_role=payload.human_role,
            difficulty=payload.difficulty or "Intermediate",
            current_round=payload.current_round or 1,
            max_rounds=payload.max_rounds or 5,
            status=payload.status or "completed",
            created_at=datetime.utcnow()
        )
        db_neg.participating_agents = payload.participating_agents or []
        db_neg.current_offer = payload.current_offer
        db_neg.previous_offer = payload.previous_offer
        db_neg.deadlock_info = payload.deadlock_info or {}
        db_neg.live_metrics = payload.metrics or {}
        db.add(db_neg)
        db.commit()
        db.refresh(db_neg)
    else:
        if effective_user_id and (not db_neg.user_id or db_neg.user_id != effective_user_id):
            db_neg.user_id = effective_user_id
        db_neg.status = payload.status or db_neg.status
        db_neg.current_round = payload.current_round or db_neg.current_round
        if payload.current_offer:
            db_neg.current_offer = payload.current_offer
        if payload.participating_agents:
            db_neg.participating_agents = payload.participating_agents
        if payload.deadlock_info:
            db_neg.deadlock_info = payload.deadlock_info
        if payload.metrics:
            db_neg.live_metrics = payload.metrics
        db.commit()
        db.refresh(db_neg)

    # Save turn history messages if provided
    if payload.history:
        existing_count = db.query(NegotiationMessageModel).filter(
            NegotiationMessageModel.negotiation_id == neg_id
        ).count()
        if len(payload.history) > existing_count:
            for item in payload.history[existing_count:]:
                msg = NegotiationMessageModel(
                    negotiation_id=neg_id,
                    round=item.get("round", db_neg.current_round),
                    agent_id=item.get("agent_id", "agent"),
                    decision=item.get("decision", "counter"),
                    reasoning=item.get("reasoning", "")
                )
                msg.proposed_offer = item.get("proposed_offer") or item.get("value")
                msg.parameters = item.get("parameters")
                db.add(msg)
            db.commit()

    messages = db.query(NegotiationMessageModel).filter(
        NegotiationMessageModel.negotiation_id == neg_id
    ).order_by(NegotiationMessageModel.id.asc()).all()

    meta = get_scenario_meta(db_neg.scenario_id, db)
    history_logs = [OfferLog(**m.to_dict()) for m in messages]

    return NegotiationDetailResponse(
        negotiation_id=db_neg.negotiation_id,
        scenario_id=db_neg.scenario_id,
        scenario_name=payload.scenario_name or meta["name"],
        scenario_description=meta["description"],
        mode=db_neg.mode or "simulation",
        human_role=db_neg.human_role,
        difficulty=db_neg.difficulty or "Intermediate",
        status=db_neg.status,
        current_round=db_neg.current_round,
        max_rounds=db_neg.max_rounds,
        participating_agents=db_neg.participating_agents or [],
        history=history_logs,
        current_offer=db_neg.current_offer,
        previous_offer=db_neg.previous_offer,
        deadlock_info=db_neg.deadlock_info,
        metrics=db_neg.live_metrics,
        created_at=db_neg.created_at.isoformat() if db_neg.created_at else None,
        updated_at=db_neg.updated_at.isoformat() if db_neg.updated_at else None,
        user_id=db_neg.user_id,
        execution_mode="Normal Mode"
    )


@router.post("", response_model=NegotiationStateResponse, status_code=status.HTTP_201_CREATED)
def create_negotiation(
    payload: NegotiationCreate,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
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

    # Derive authenticated user if token present; never trust forged user_id
    auth_user = get_current_user_optional(authorization, db)
    effective_user_id = str(auth_user.id) if auth_user else payload.user_id

    orch = create_negotiation_session(
        db=db,
        scenario_id=payload.scenario_id or "vendor_pricing",
        agent_profiles=agents_data,
        max_rounds=payload.max_rounds or 5,
        mode=payload.mode or "simulation",
        human_role=payload.human_role,
        user_id=effective_user_id,
        difficulty=payload.difficulty or "Intermediate"
    )

    return NegotiationStateResponse(**orch.get_state_dict())


@router.get("/{negotiation_id}", response_model=NegotiationStateResponse)
def get_negotiation_state(
    negotiation_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Retrieve current negotiation session state."""
    db_neg = db.query(NegotiationModel).filter(NegotiationModel.negotiation_id == negotiation_id).first()
    if not db_neg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )

    # If session is owned by a user, enforce ownership verification
    if db_neg.user_id:
        user = get_current_user_optional(authorization, db)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required to view this private session."
            )
        verify_negotiation_ownership(db_neg, user)

    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )
    return NegotiationStateResponse(**orch.get_state_dict())


@router.get("/{negotiation_id}/detail", response_model=NegotiationDetailResponse)
def get_negotiation_detail(
    negotiation_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """
    Retrieves full read-only detail of a previously performed negotiation session.
    Verifies user ownership before returning session data.
    """
    db_neg = db.query(NegotiationModel).filter(NegotiationModel.negotiation_id == negotiation_id).first()
    if not db_neg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )
    verify_negotiation_ownership(db_neg, current_user)

    messages = db.query(NegotiationMessageModel).filter(
        NegotiationMessageModel.negotiation_id == negotiation_id
    ).order_by(NegotiationMessageModel.id.asc()).all()

    history_logs = [OfferLog(**m.to_dict()) for m in messages]
    meta = get_scenario_meta(db_neg.scenario_id, db)

    execution_mode = "Normal Mode"
    if db_neg.metrics_json and "reasoning_engine" in db_neg.metrics_json:
        execution_mode = "LLM Mode"

    return NegotiationDetailResponse(
        negotiation_id=db_neg.negotiation_id,
        scenario_id=db_neg.scenario_id,
        scenario_name=meta["name"],
        scenario_description=meta["description"],
        mode=db_neg.mode or "simulation",
        human_role=db_neg.human_role,
        difficulty=db_neg.difficulty or "Intermediate",
        status=db_neg.status,
        current_round=db_neg.current_round,
        max_rounds=db_neg.max_rounds,
        participating_agents=db_neg.participating_agents or [],
        history=history_logs,
        current_offer=db_neg.current_offer,
        previous_offer=db_neg.previous_offer,
        deadlock_info=db_neg.deadlock_info,
        metrics=db_neg.live_metrics,
        created_at=db_neg.created_at.isoformat() if db_neg.created_at else None,
        updated_at=db_neg.updated_at.isoformat() if db_neg.updated_at else None,
        user_id=db_neg.user_id,
        execution_mode=execution_mode
    )


@router.get("/{negotiation_id}/export")
def export_single_negotiation(
    negotiation_id: str,
    format: str = Query("pdf", description="Export format: pdf, csv, or json"),
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """
    Exports a single negotiation session record in PDF, CSV, or JSON format.
    Ensures ownership verification and secure sanitization.
    """
    fmt = format.lower().strip()
    if fmt not in ["pdf", "csv", "json"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid export format '{format}'. Supported formats are: pdf, csv, json."
        )

    db_neg = db.query(NegotiationModel).filter(NegotiationModel.negotiation_id == negotiation_id).first()
    if not db_neg:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )
    verify_negotiation_ownership(db_neg, current_user)

    messages = db.query(NegotiationMessageModel).filter(
        NegotiationMessageModel.negotiation_id == negotiation_id
    ).order_by(NegotiationMessageModel.id.asc()).all()
    messages_dict = [m.to_dict() for m in messages]

    meta = get_scenario_meta(db_neg.scenario_id, db)
    scen_name = meta["name"]

    slug = re.sub(r'[^a-zA-Z0-9_\-]', '', db_neg.scenario_id.lower()) or "session"
    date_str = db_neg.created_at.strftime('%Y-%m-%d') if db_neg.created_at else datetime.utcnow().strftime('%Y-%m-%d')
    filename = f"negomind-{slug}-{date_str}.{fmt}"

    session_dict = {
        "negotiation_id": db_neg.negotiation_id,
        "scenario_id": db_neg.scenario_id,
        "scenario_name": scen_name,
        "mode": db_neg.mode or "simulation",
        "human_role": db_neg.human_role,
        "difficulty": db_neg.difficulty or "Intermediate",
        "status": db_neg.status,
        "current_round": db_neg.current_round,
        "max_rounds": db_neg.max_rounds,
        "participating_agents": db_neg.participating_agents or [],
        "current_offer": db_neg.current_offer,
        "previous_offer": db_neg.previous_offer,
        "deadlock_info": db_neg.deadlock_info,
        "metrics": db_neg.live_metrics,
        "created_at": db_neg.created_at.isoformat() if db_neg.created_at else "",
        "updated_at": db_neg.updated_at.isoformat() if db_neg.updated_at else "",
        "user_id": db_neg.user_id,
    }

    if fmt == "json":
        clean_dict = sanitize_session_for_export({
            **session_dict,
            "history": messages_dict
        })
        return Response(
            content=json.dumps(clean_dict, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    elif fmt == "csv":
        csv_data = generate_session_csv(session_dict, messages_dict)
        return Response(
            content=csv_data,
            media_type="text/csv; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        # PDF format
        pdf_data = generate_session_pdf(session_dict, messages_dict, db_neg.participating_agents or [])
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )


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

    try:
        res = await orch.run_turn()
        save_orchestrator_state(db, orch)

        last_turn = orch.history[-1] if orch.history else {}
        state_dict = orch.get_state_dict()
        return {
            "turn": last_turn,
            "state": NegotiationStateResponse(**state_dict)
        }
    except HTTPException:
        raise
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Turn execution failed: {str(exc)}"
        )

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

    try:
        await orch.run_to_completion()
        save_orchestrator_state(db, orch)
        return NegotiationStateResponse(**orch.get_state_dict())
    except HTTPException:
        raise
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Run to completion failed: {str(exc)}"
        )

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
