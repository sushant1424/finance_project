from pydantic import BaseModel


class AnomalyResponse(BaseModel):
    id: str
    date: str
    description: str
    category: str
    amount: float
    z_score: float | None
    anomaly_severity: str | None
    anomaly_reviewed: bool
    expected_range: dict | None = None

    class Config:
        from_attributes = True
