import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base

FREQUENCIES = ("weekly", "bi-weekly", "monthly", "quarterly", "yearly")


class RecurringBill(Base):
    __tablename__ = "recurring_bills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # income | expense
    description = Column(String, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    category = Column(String, nullable=False)
    frequency = Column(String, nullable=False, default="monthly")
    due_day = Column(Integer, nullable=True)  # 1–31, used for monthly+ bills
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
