from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    type: str = Field(pattern="^(income|expense)$")
    amount: Decimal = Field(gt=0)
    description: str
    category: str
    date: date_type
    notes: str | None = None


class TransactionUpdate(BaseModel):
    type: str | None = None
    amount: Decimal | None = None
    description: str | None = None
    category: str | None = None
    date: date_type | None = None
    notes: str | None = None


class TransactionResponse(BaseModel):
    id: str
    type: str
    amount: float
    description: str
    category: str
    date: str
    notes: str | None
    is_anomaly: bool
    z_score: float | None
    anomaly_severity: str | None
    anomaly_reviewed: bool
    created_at: str

    class Config:
        from_attributes = True


class BulkDeleteRequest(BaseModel):
    ids: list[str]
