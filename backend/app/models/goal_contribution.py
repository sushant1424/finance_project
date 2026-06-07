import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class GoalContribution(Base):
    __tablename__ = "goal_contributions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    note = Column(String)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
