import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from app.database import Base

class ContactMessageModel(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    topic = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    email_sent = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="received", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "topic": self.topic,
            "message": self.message,
            "email_sent": self.email_sent,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
