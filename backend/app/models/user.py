import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    currency = Column(String, default="NPR")
    date_format = Column(String, default="DD/MM/YYYY")
    month_start_day = Column(Integer, default=1)
    compact_mode = Column(Boolean, default=False)
    show_cents = Column(Boolean, default=True)
    chart_animation = Column(Boolean, default=True)
    first_day_of_week = Column(String, default="Sunday")
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
