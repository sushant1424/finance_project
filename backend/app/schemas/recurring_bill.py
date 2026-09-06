from decimal import Decimal

from pydantic import BaseModel, Field


class RecurringBillCreate(BaseModel):
    type: str = Field(pattern="^(income|expense)$")
    description: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(gt=0)
    category: str = Field(min_length=1, max_length=50)
    frequency: str = Field(pattern="^(weekly|bi-weekly|monthly|quarterly|yearly)$")
    due_day: int | None = Field(None, ge=1, le=31)
    notes: str | None = Field(None, max_length=500)


class RecurringBillUpdate(BaseModel):
    type: str | None = Field(None, pattern="^(income|expense)$")
    description: str | None = Field(None, min_length=1, max_length=100)
    amount: Decimal | None = Field(None, gt=0)
    category: str | None = Field(None, min_length=1, max_length=50)
    frequency: str | None = Field(None, pattern="^(weekly|bi-weekly|monthly|quarterly|yearly)$")
    due_day: int | None = Field(None, ge=1, le=31)
    notes: str | None = Field(None, max_length=500)
    is_active: bool | None = None
