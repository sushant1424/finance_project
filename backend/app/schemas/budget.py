from decimal import Decimal

from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category: str
    monthly_limit: Decimal = Field(gt=0)
    month: int = Field(ge=1, le=12)
    year: int


class BudgetUpdate(BaseModel):
    monthly_limit: Decimal | None = None


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

    class Config:
        from_attributes = True
