from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel, Field


class GoalCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    target_amount: Decimal = Field(gt=0)
    current_amount: Decimal = Field(ge=0, default=0)
    target_date: date_type
    icon: str = Field("🎯", min_length=1, max_length=20)
    color: str = Field("#06b6d4", pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")


class GoalUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    target_amount: Decimal | None = Field(None, gt=0)
    current_amount: Decimal | None = Field(None, ge=0)
    target_date: date_type | None = None
    icon: str | None = Field(None, min_length=1, max_length=20)
    color: str | None = Field(None, pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")


class ContributionCreate(BaseModel):
    amount: Decimal = Field(gt=0)
    note: str | None = Field(None, max_length=200)
    date: date_type
    account_id: str = Field(min_length=1)


class GoalWithdrawRequest(BaseModel):
    account_id: str = Field(min_length=1)
    note: str | None = Field(None, max_length=200)


class GoalConvertRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    target_amount: Decimal = Field(gt=0)
    target_date: date_type
    icon: str | None = Field(None, min_length=1, max_length=20)
    color: str | None = Field(None, pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")


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
    goal_status: str = "active"
    completed_at: str | None = None

    class Config:
        from_attributes = True
