from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.goal import Goal
from app.models.user import User
from app.schemas.goal import ContributionCreate, GoalCreate, GoalUpdate
from app.services import goal_service

router = APIRouter(prefix="/goals", tags=["goals"])


@router.get("")
def list_goals(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return goal_service.get_goals(user.id, db)


@router.post("")
def create_goal(
    data: GoalCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return goal_service.create_goal(user.id, data, db)


@router.put("/{goal_id}")
def update_goal(
    goal_id: UUID,
    data: GoalUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal_service.update_goal(g, data, db)


@router.delete("/{goal_id}")
def delete_goal(
    goal_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal_service.delete_goal(g, db)
    return {"message": "Deleted"}


@router.post("/{goal_id}/contribute")
def contribute(
    goal_id: UUID,
    data: ContributionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal_service.add_contribution(g, data, db)


@router.get("/{goal_id}/contributions")
def get_contributions(
    goal_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    g = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user.id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal_service.get_contributions(goal_id, db)
