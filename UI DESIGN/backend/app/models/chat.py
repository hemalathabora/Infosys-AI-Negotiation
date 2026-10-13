import json
import uuid
import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class ChatConversationModel(Base):
    __tablename__ = "chat_conversations"

    conversation_id = Column(String, primary_key=True, default=lambda: f"conv_{uuid.uuid4().hex[:12]}")
    user_id = Column(String, nullable=True, index=True)
    title = Column(String, nullable=False, default="General Chat")
    context_mode = Column(String, nullable=False, default="general")  # 'general' or 'negotiation'
    negotiation_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def to_dict(self):
        return {
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "title": self.title,
            "context_mode": self.context_mode,
            "negotiation_id": self.negotiation_id,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else ""
        }

class ChatMessageModel(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    conversation_id = Column(String, ForeignKey("chat_conversations.conversation_id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String, nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    model = Column(String, nullable=True)
    provider = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "role": self.role,
            "content": self.content,
            "model": self.model,
            "provider": self.provider,
            "timestamp": self.timestamp.isoformat() if self.timestamp else datetime.datetime.utcnow().isoformat()
        }
