import uuid
from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.core.database import Base


class NetWorthSnapshot(Base):
    __tablename__ = "networth_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    total_assets = Column(Numeric(12, 2), nullable=False)
    total_liabilities = Column(Numeric(12, 2), nullable=False)
    net_worth = Column(Numeric(12, 2), nullable=False)
    snapshot_date = Column(Date, nullable=False)
    assets_breakdown = Column(JSONB, default={})
    liabilities_breakdown = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
