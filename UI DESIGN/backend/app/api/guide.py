from pydantic import BaseModel
from typing import Optional, Any, Dict
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.guide_service import answer_guide_query
from app.services.chat_service import process_chat_query
from app.schemas.chat import ChatQueryRequest

router = APIRouter(prefix="/api/guide", tags=["Guide Assistant"])

class GuideQueryRequest(BaseModel):
    query: str
    scenario_id: Optional[str] = "vendor_pricing"
    negotiation_id: Optional[str] = None

@router.post("/query")
async def process_guide_query(
    payload: GuideQueryRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """Answers user queries regarding scenario setup, agent personas, and negotiation strategies."""
    # Build ChatQueryRequest
    chat_req = ChatQueryRequest(
        message=payload.query,
        negotiation_id=payload.negotiation_id,
        context=f"Scenario: {payload.scenario_id or 'vendor_pricing'}"
    )
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    # Process through enhanced general chat service
    res = await process_chat_query(db=db, payload=chat_req, client_ip=client_ip)
    
    # Static guide fallback if needed for existing test compatibility
    guide_base = answer_guide_query(payload.query, payload.scenario_id or "vendor_pricing")

    return {
        "answer": res.message or guide_base.get("answer", ""),
        "topic": guide_base.get("topic", "general"),
        "suggested_actions": guide_base.get("suggested_actions", ["Configure Agents", "Run Simulation"]),
        "conversation_id": res.conversation_id,
        "model": res.model,
        "provider": res.provider
    }
