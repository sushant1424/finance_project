import uuid
from datetime import datetime

from app.core.database import Base
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID


class UserCategory(Base):
    __tablename__ = "user_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    icon = Column(String, default="📁")
    color = Column(String, default="#71717a")
    created_at = Column(DateTime, default=datetime.utcnow)
