import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class DismissedNotification(Base):
    __tablename__ = "dismissed_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    notification_id = Column(String, nullable=False)
    dismissed_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "notification_id", name="uq_user_notification"),)
