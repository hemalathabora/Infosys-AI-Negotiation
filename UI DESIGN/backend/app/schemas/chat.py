from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ChatMessageSchema(BaseModel):
    role: str = Field(..., description="Role of message sender: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Content text of message")
    timestamp: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[str] = None

class ChatQueryRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000, description="User question or prompt")
    conversation_id: Optional[str] = Field(None, description="Optional existing conversation ID")
    context: Optional[Any] = Field(None, description="Optional context string or structured dict")
    negotiation_id: Optional[str] = Field(None, description="Optional active negotiation session ID")

class ChatQueryResponse(BaseModel):
    success: bool = True
    message: str = Field(..., description="AI assistant response text")
    conversation_id: str = Field(..., description="Unique conversation identifier")
    model: str = Field(..., description="Model name used for generation")
    provider: str = Field(..., description="Provider used ('gemini', 'mock', 'fallback')")
    context_mode: str = Field("general", description="Logical context mode ('general' or 'negotiation')")
    history: Optional[List[ChatMessageSchema]] = None

class ConversationSummarySchema(BaseModel):
    conversation_id: str
    user_id: Optional[str] = None
    title: str
    context_mode: str
    negotiation_id: Optional[str] = None
    created_at: str
    updated_at: str
    message_count: int = 0

class ConversationDetailResponse(BaseModel):
    conversation_id: str
    user_id: Optional[str] = None
    title: str
    context_mode: str
    negotiation_id: Optional[str] = None
    messages: List[ChatMessageSchema] = []
