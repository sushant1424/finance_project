from uuid import UUID

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.models.user_category import UserCategory
from app.schemas.category import CategoryCreate, CategoryUpdate
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

router = APIRouter(prefix="/categories", tags=["categories"])


def _serialize(c: UserCategory) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "icon": c.icon,
        "color": c.color,
        "custom": True,
    }


@router.get("")
def list_categories(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    items = (
        db.query(UserCategory)
        .filter(UserCategory.user_id == user.id)
        .order_by(UserCategory.created_at)
        .all()
    )
    return [_serialize(c) for c in items]


@router.post("")
def create_category(
    data: CategoryCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = UserCategory(user_id=user.id, **data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return _serialize(c)


@router.put("/{category_id}")
def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = (
        db.query(UserCategory)
        .filter(UserCategory.id == category_id, UserCategory.user_id == user.id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(c, field, value)
    db.commit()
    db.refresh(c)
    return _serialize(c)


@router.delete("/{category_id}")
def delete_category(
    category_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    c = (
        db.query(UserCategory)
        .filter(UserCategory.id == category_id, UserCategory.user_id == user.id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(c)
    db.commit()
    return {"message": "Deleted"}
