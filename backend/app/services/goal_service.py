from datetime import date, datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.goal import Goal
from app.models.goal_contribution import GoalContribution
from app.models.transaction import Transaction
from app.schemas.goal import ContributionCreate, GoalConvertRequest, GoalCreate, GoalUpdate, GoalWithdrawRequest

GOALS_ACCOUNT_NAME = "Goal savings"


def _months_remaining(target: date) -> int:
    today = date.today()
    if target <= today:
        return 0
    months = (target.year - today.year) * 12 + (target.month - today.month)
    return max(months, 1) if target.day >= today.day else max(months - 1, 1)


def _pace_status(current: float, target: float, target_date: date, goal_status: str) -> str:
    if goal_status in ("completed", "withdrawn") or current >= target:
        return "achieved"
    months = _months_remaining(target_date)
    if months == 0:
        return "behind"
    return "on_track" if current / target >= 0.5 or months > 3 else "behind"


def _serialize_goal(g: Goal) -> dict:
    current = float(g.current_amount or 0)
    target = float(g.target_amount)
    months = _months_remaining(g.target_date)
    remaining = max(target - current, 0)
    goal_status = g.status or "active"
    return {
        "id": str(g.id),
        "name": g.name,
        "target_amount": target,
        "current_amount": current,
        "target_date": g.target_date.isoformat(),
        "icon": g.icon,
        "color": g.color,
        "progress_pct": round(min((current / target) * 100, 100), 1) if target else 0,
        "months_remaining": months,
        "monthly_needed": round(remaining / months, 2) if months > 0 else remaining,
        "status": _pace_status(current, target, g.target_date, goal_status),
        "goal_status": goal_status,
        "completed_at": g.completed_at.isoformat() if g.completed_at else None,
    }


def _owned_account(user_id, account_id: UUID, db: Session) -> Account:
    account = (
        db.query(Account)
        .filter(Account.id == account_id, Account.user_id == user_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=400, detail="Account not found")
    return account


def ensure_goals_account(user_id, db: Session) -> Account:
    existing = (
        db.query(Account)
        .filter(Account.user_id == user_id, Account.name == GOALS_ACCOUNT_NAME)
        .first()
    )
    if existing:
        return existing
    account = Account(
        user_id=user_id,
        name=GOALS_ACCOUNT_NAME,
        type="bank",
        color="#22c55e",
        is_default=False,
        opening_balance=0,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def get_goals(user_id, db: Session) -> list:
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == user_id)
        .order_by(Goal.created_at.desc())
        .all()
    )
    return [_serialize_goal(g) for g in goals]


def create_goal(user_id, data: GoalCreate, db: Session) -> dict:
    ensure_goals_account(user_id, db)
    g = Goal(user_id=user_id, status="active", **data.model_dump())
    db.add(g)
    db.commit()
    db.refresh(g)
    return _serialize_goal(g)


def update_goal(g: Goal, data: GoalUpdate, db: Session) -> dict:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(g, field, value)
    db.commit()
    db.refresh(g)
    return _serialize_goal(g)


def delete_goal(g: Goal, db: Session) -> None:
    db.query(GoalContribution).filter(GoalContribution.goal_id == g.id).delete()
    db.delete(g)
    db.commit()


def add_contribution(g: Goal, data: ContributionCreate, user_id, db: Session) -> dict:
    if (g.status or "active") in ("completed", "withdrawn"):
        raise HTTPException(status_code=400, detail="Cannot contribute to a closed goal")

    from_id = UUID(str(data.account_id))
    _owned_account(user_id, from_id, db)
    goals_account = ensure_goals_account(user_id, db)
    if goals_account.id == from_id:
        raise HTTPException(status_code=400, detail="Choose a different account to contribute from")

    tx = Transaction(
        user_id=user_id,
        type="transfer",
        amount=data.amount,
        description=f"Goal: {g.name}",
        category="transfer",
        date=data.date,
        notes=data.note or f"Contribution to {g.name}",
        account_id=from_id,
        to_account_id=goals_account.id,
        is_recurring=False,
    )
    db.add(tx)
    db.flush()

    c = GoalContribution(
        goal_id=g.id,
        amount=data.amount,
        note=data.note,
        date=data.date,
        account_id=from_id,
        transaction_id=tx.id,
    )
    g.current_amount = float(g.current_amount or 0) + float(data.amount)
    db.add(c)
    db.commit()
    db.refresh(g)
    return _serialize_goal(g)


def complete_goal(g: Goal, db: Session) -> dict:
    if float(g.current_amount or 0) < float(g.target_amount):
        raise HTTPException(status_code=400, detail="Goal has not reached its target yet")
    g.status = "completed"
    g.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(g)
    return _serialize_goal(g)


def withdraw_goal(g: Goal, data: GoalWithdrawRequest, user_id, db: Session) -> dict:
    amount = float(g.current_amount or 0)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Nothing to withdraw")

    to_id = UUID(str(data.account_id))
    _owned_account(user_id, to_id, db)
    goals_account = ensure_goals_account(user_id, db)
    if goals_account.id == to_id:
        raise HTTPException(status_code=400, detail="Choose a different account to withdraw to")

    tx = Transaction(
        user_id=user_id,
        type="transfer",
        amount=amount,
        description=f"Goal withdrawn: {g.name}",
        category="transfer",
        date=date.today(),
        notes=data.note or f"Withdrew completed goal {g.name}",
        account_id=goals_account.id,
        to_account_id=to_id,
        is_recurring=False,
    )
    db.add(tx)
    g.current_amount = 0
    g.status = "withdrawn"
    g.completed_at = g.completed_at or datetime.utcnow()
    db.commit()
    db.refresh(g)
    return _serialize_goal(g)


def convert_goal(g: Goal, data: GoalConvertRequest, user_id, db: Session) -> dict:
    """Mark current goal completed and open a new goal with the saved balance."""
    saved = float(g.current_amount or 0)
    if saved <= 0:
        raise HTTPException(status_code=400, detail="No savings to convert")

    g.status = "completed"
    g.completed_at = datetime.utcnow()
    g.current_amount = 0

    new_goal = Goal(
        user_id=user_id,
        name=data.name,
        target_amount=data.target_amount,
        current_amount=saved,
        target_date=data.target_date,
        icon=data.icon or g.icon,
        color=data.color or g.color,
        status="active",
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return _serialize_goal(new_goal)


def get_contributions(goal_id, db: Session) -> list:
    items = (
        db.query(GoalContribution)
        .filter(GoalContribution.goal_id == goal_id)
        .order_by(GoalContribution.date.desc())
        .all()
    )
    return [
        {
            "id": str(c.id),
            "amount": float(c.amount),
            "note": c.note,
            "date": c.date.isoformat(),
            "account_id": str(c.account_id) if c.account_id else None,
            "transaction_id": str(c.transaction_id) if c.transaction_id else None,
        }
        for c in items
    ]
