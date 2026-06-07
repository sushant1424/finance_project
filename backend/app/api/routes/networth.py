from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.networth_snapshot import NetWorthSnapshot
from app.models.user import User

router = APIRouter(prefix="/networth", tags=["networth"])


class SnapshotCreate(BaseModel):
    total_assets: float
    total_liabilities: float
    snapshot_date: date
    assets_breakdown: dict = {}
    liabilities_breakdown: dict = {}


def _serialize(s: NetWorthSnapshot) -> dict:
    return {
        "id": str(s.id),
        "total_assets": float(s.total_assets),
        "total_liabilities": float(s.total_liabilities),
        "net_worth": float(s.net_worth),
        "snapshot_date": s.snapshot_date.isoformat(),
        "assets_breakdown": s.assets_breakdown or {},
        "liabilities_breakdown": s.liabilities_breakdown or {},
    }


@router.get("/snapshots")
def list_snapshots(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = (
        db.query(NetWorthSnapshot)
        .filter(NetWorthSnapshot.user_id == user.id)
        .order_by(NetWorthSnapshot.snapshot_date.desc())
        .all()
    )
    return [_serialize(s) for s in items]


@router.post("/snapshot")
def create_snapshot(
    data: SnapshotCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = NetWorthSnapshot(
        user_id=user.id,
        total_assets=data.total_assets,
        total_liabilities=data.total_liabilities,
        net_worth=data.total_assets - data.total_liabilities,
        snapshot_date=data.snapshot_date,
        assets_breakdown=data.assets_breakdown,
        liabilities_breakdown=data.liabilities_breakdown,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return _serialize(s)


@router.delete("/snapshot/{snapshot_id}")
def delete_snapshot(
    snapshot_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = db.query(NetWorthSnapshot).filter(
        NetWorthSnapshot.id == snapshot_id, NetWorthSnapshot.user_id == user.id
    ).first()
    if not s:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(s)
    db.commit()
    return {"message": "Deleted"}
