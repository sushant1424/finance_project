import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

ACCOUNT_TYPES = ("cash", "bank", "credit_card")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False, default="cash")
    color = Column(String, default="#6366f1")
    is_default = Column(Boolean, default=False)
    opening_balance = Column(Numeric(12, 2), default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
