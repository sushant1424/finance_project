from datetime import date as date_type
from decimal import Decimal

from pydantic import BaseModel, Field, model_validator


class TransactionCreate(BaseModel):
    type: str = Field(pattern="^(income|expense|transfer)$")
    amount: Decimal = Field(gt=0)
    description: str = Field(min_length=1, max_length=100)
    category: str = Field(min_length=1, max_length=50)
    date: date_type
    notes: str | None = Field(None, max_length=500)
    is_recurring: bool = False
    frequency: str | None = Field(None, pattern="^(weekly|bi-weekly|monthly|quarterly|yearly)$")
    account_id: str | None = None
    to_account_id: str | None = None

    @model_validator(mode="after")
    def validate_transfer(self):
        if self.type == "transfer":
            if not self.account_id or not self.to_account_id:
                raise ValueError("Transfer requires both from and to accounts")
            if self.account_id == self.to_account_id:
                raise ValueError("From and to accounts must be different")
            self.is_recurring = False
            if not self.category or self.category == "food":
                self.category = "transfer"
        else:
            self.to_account_id = None
        return self


class TransactionUpdate(BaseModel):
    type: str | None = Field(None, pattern="^(income|expense|transfer)$")
    amount: Decimal | None = Field(None, gt=0)
    description: str | None = Field(None, min_length=1, max_length=100)
    category: str | None = Field(None, min_length=1, max_length=50)
    date: date_type | None = None
    notes: str | None = Field(None, max_length=500)
    is_recurring: bool | None = None
    frequency: str | None = Field(None, pattern="^(weekly|bi-weekly|monthly|quarterly|yearly)$")
    account_id: str | None = None
    to_account_id: str | None = None


class TransactionResponse(BaseModel):
    id: str
    type: str
    amount: float
    description: str
    category: str
    date: str
    notes: str | None
    is_recurring: bool
    created_at: str

    class Config:
        from_attributes = True


class BulkDeleteRequest(BaseModel):
    ids: list[str]


class CategorySuggestRequest(BaseModel):
    description: str
    type: str = "expense"
