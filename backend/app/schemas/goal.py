from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel, Field


class GoalCreate(BaseModel):
    name: str
    target_amount: Decimal = Field(gt=0)
    current_amount: Decimal = Field(ge=0, default=0)
    target_date: date_type
    icon: str = "🎯"
    color: str = "#06b6d4"


class GoalUpdate(BaseModel):
    name: str | None = None
    target_amount: Decimal | None = None
    current_amount: Decimal | None = None
    target_date: date_type | None = None
    icon: str | None = None
    color: str | None = None


class ContributionCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    note: str | None = None
    date: date_type


class GoalResponse(BaseModel):
    id: str
    name: str
    target_amount: float
    current_amount: float
    target_date: str
    icon: str
    color: str
    progress_pct: float = 0
    months_remaining: int = 0
    monthly_needed: float = 0
    status: str = "on_track"

    class Config:
        from_attributes = True
