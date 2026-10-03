from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.chat import (
    ChatQueryRequest,
    ChatQueryResponse,
    ConversationSummarySchema,
    ConversationDetailResponse,
    ChatMessageSchema
)
from app.services import chat_service
from app.models.chat import ChatConversationModel, ChatMessageModel

router = APIRouter(prefix="/api/chat", tags=["General AI Chatbot"])

def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    Extracts authenticated user_id from Bearer token if present; otherwise returns None for anonymous.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.replace("Bearer ", "").strip()
    parts = token.split("_")
    if len(parts) >= 3 and parts[0] == "nego" and parts[1] == "token":
        return parts[2]
    return None

@router.post("", response_model=ChatQueryResponse)
@router.post("/", response_model=ChatQueryResponse)
async def query_chat(
    payload: ChatQueryRequest,
    request: Request,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    General AI Chatbot Query Endpoint.
    Supports general knowledge, code, AI/ML, math, negotiation theory, and live session analysis.
    """
    user_id = get_optional_user_id(authorization)
    client_ip = request.client.host if request.client else "127.0.0.1"
    
    return await chat_service.process_chat_query(
        db=db,
        payload=payload,
        user_id=user_id,
        client_ip=client_ip
    )

@router.get("/conversations", response_model=List[ConversationSummarySchema])
def list_user_conversations(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Fetches list of conversations belonging to the authenticated user.
    """
    user_id = get_optional_user_id(authorization)
    if not user_id:
        return []
        
    conversations = db.query(ChatConversationModel).filter(
        ChatConversationModel.user_id == user_id
    ).order_by(ChatConversationModel.updated_at.desc()).all()

    summaries = []
    for c in conversations:
        msg_count = db.query(ChatMessageModel).filter(ChatMessageModel.conversation_id == c.conversation_id).count()
        summaries.append(ConversationSummarySchema(
            conversation_id=c.conversation_id,
            user_id=c.user_id,
            title=c.title,
            context_mode=c.context_mode,
            negotiation_id=c.negotiation_id,
            created_at=c.created_at.isoformat() if c.created_at else "",
            updated_at=c.updated_at.isoformat() if c.updated_at else "",
            message_count=msg_count
        ))

    return summaries

@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
def get_conversation_detail(
    conversation_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Fetches full message history for a specific conversation with user isolation.
    """
    user_id = get_optional_user_id(authorization)
    conv = db.query(ChatConversationModel).filter(
        ChatConversationModel.conversation_id == conversation_id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # Enforce isolation: If conversation is tied to a user_id, ensure requesting user matches
    if conv.user_id and user_id and conv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to this conversation.")

    messages = db.query(ChatMessageModel).filter(
        ChatMessageModel.conversation_id == conversation_id
    ).order_by(ChatMessageModel.id.asc()).all()

    msg_schemas = [
        ChatMessageSchema(
            role=m.role,
            content=m.content,
            timestamp=m.timestamp.isoformat() if m.timestamp else "",
            model=m.model,
            provider=m.provider
        )
        for m in messages
    ]

    return ConversationDetailResponse(
        conversation_id=conv.conversation_id,
        user_id=conv.user_id,
        title=conv.title,
        context_mode=conv.context_mode,
        negotiation_id=conv.negotiation_id,
        messages=msg_schemas
    )

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Deletes a conversation and its messages with user isolation.
    """
    user_id = get_optional_user_id(authorization)
    conv = db.query(ChatConversationModel).filter(
        ChatConversationModel.conversation_id == conversation_id
    ).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    if conv.user_id and user_id and conv.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to delete this conversation.")

    db.query(ChatMessageModel).filter(ChatMessageModel.conversation_id == conversation_id).delete()
    db.delete(conv)
    db.commit()

    return {"status": "success", "message": f"Conversation '{conversation_id}' deleted successfully."}
