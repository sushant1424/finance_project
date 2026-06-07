from datetime import date

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.goal_contribution import GoalContribution
from app.schemas.goal import ContributionCreate, GoalCreate, GoalUpdate


def _months_remaining(target: date) -> int:
    today = date.today()
    if target <= today:
        return 0
    months = (target.year - today.year) * 12 + (target.month - today.month)
    return max(months, 1) if target.day >= today.day else max(months - 1, 1)


def _goal_status(current: float, target: float, target_date: date) -> str:
    if current >= target:
        return "achieved"
    months = _months_remaining(target_date)
    if months == 0:
        return "behind"
    needed = (target - current) / months
    return "on_track" if current / target >= 0.5 or months > 3 else "behind"


def _serialize_goal(g: Goal) -> dict:
    current = float(g.current_amount)
    target = float(g.target_amount)
    months = _months_remaining(g.target_date)
    remaining = max(target - current, 0)
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
        "status": _goal_status(current, target, g.target_date),
    }


def get_goals(user_id, db: Session) -> list:
    goals = db.query(Goal).filter(Goal.user_id == user_id).all()
    return [_serialize_goal(g) for g in goals]


def create_goal(user_id, data: GoalCreate, db: Session) -> dict:
    g = Goal(user_id=user_id, **data.model_dump())
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


def add_contribution(g: Goal, data: ContributionCreate, db: Session) -> dict:
    c = GoalContribution(goal_id=g.id, **data.model_dump())
    g.current_amount = float(g.current_amount) + float(data.amount)
    db.add(c)
    db.commit()
    db.refresh(g)
    return _serialize_goal(g)


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
        }
        for c in items
    ]
