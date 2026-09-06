from decimal import Decimal

from pydantic import BaseModel, Field


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    type: str = Field(pattern="^(cash|bank|credit_card)$")
    color: str | None = Field(None, max_length=20)
    opening_balance: Decimal = Field(default=Decimal("0"))


class AccountUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=50)
    type: str | None = Field(None, pattern="^(cash|bank|credit_card)$")
    color: str | None = Field(None, max_length=20)
