from decimal import Decimal

from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category: str = Field(min_length=1, max_length=50)
    monthly_limit: Decimal = Field(gt=0)
    month: int = Field(ge=1, le=12)
    year: int = Field(ge=2000, le=2100)
    rollover: bool = False


class BudgetUpdate(BaseModel):
    monthly_limit: Decimal | None = Field(None, gt=0)
    rollover: bool | None = None


class BudgetResponse(BaseModel):
    id: str
    category: str
    monthly_limit: float
    month: int
    year: int
    spent: float = 0
    remaining: float = 0
    utilization_pct: float = 0
    pace: dict | None = None
    rollover: bool = False
    rollover_amount: float = 0
    effective_limit: float = 0
    days_left: int = 0
    days_in_month: int = 0
    period_elapsed_pct: float = 0

    class Config:
        from_attributes = True
