import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.contact import ContactMessageModel
from app.services.contact_service import dispatch_contact_email, TARGET_CONTACT_EMAIL

logger = logging.getLogger("contact_api")

router = APIRouter(prefix="/api/contact", tags=["contact"])

class ContactSubmissionRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Sender's full name")
    email: EmailStr = Field(..., description="Sender's valid email address")
    topic: str = Field(..., min_length=1, max_length=100, description="Selected inquiry topic")
    message: str = Field(..., min_length=2, max_length=5000, description="Inquiry message body")

class ContactSubmissionResponse(BaseModel):
    success: bool
    message: str
    target_email: str = TARGET_CONTACT_EMAIL
    email_dispatched: bool
    data: Optional[dict] = None

@router.post("", response_model=ContactSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    payload: ContactSubmissionRequest,
    db: Session = Depends(get_db)
):
    """
    Receives an inquiry from the Contact Us page, records it in the database,
    and dispatches a formatted notification email to negomindai@gmail.com.
    """
    logger.info(f"Received contact submission from {payload.name} ({payload.email}) regarding {payload.topic}")

    # 1. Create database record to guarantee no message is lost
    db_record = ContactMessageModel(
        name=payload.name.strip(),
        email=payload.email.strip().lower(),
        topic=payload.topic.strip(),
        message=payload.message.strip(),
        email_sent=False,
        status="received"
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    # 2. Dispatch email to negomindai@gmail.com
    email_success, email_msg = await dispatch_contact_email(
        name=payload.name,
        email=payload.email,
        topic=payload.topic,
        message=payload.message
    )

    if email_success:
        db_record.email_sent = True
        db.commit()
        db.refresh(db_record)

    return ContactSubmissionResponse(
        success=True,
        message=f"Thank you, {payload.name}! Your message has been sent to {TARGET_CONTACT_EMAIL}.",
        target_email=TARGET_CONTACT_EMAIL,
        email_dispatched=email_success,
        data=db_record.to_dict()
    )


@router.get("", response_model=List[dict])
def list_contact_submissions(db: Session = Depends(get_db)):
    """Lists recent contact inquiries (for administrative tracking)."""
    messages = db.query(ContactMessageModel).order_by(ContactMessageModel.created_at.desc()).limit(50).all()
    return [m.to_dict() for m in messages]
