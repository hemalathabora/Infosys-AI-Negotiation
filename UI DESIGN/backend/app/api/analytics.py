from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.negotiation_service import load_orchestrator
from app.services.analytics_service import calculate_negotiation_analytics

router = APIRouter(prefix="/api/negotiations", tags=["Analytics"])

@router.get("/{negotiation_id}/analytics")
def get_negotiation_analytics(negotiation_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed concession timeline, convergence rate, and metrics for a negotiation session."""
    orch = load_orchestrator(db, negotiation_id)
    if not orch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Negotiation session '{negotiation_id}' not found."
        )

    state = orch.get_state_dict()
    return calculate_negotiation_analytics(state)
