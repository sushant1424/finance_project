from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.account import Account
from app.models.user import User
from app.schemas.account import AccountCreate, AccountUpdate
from app.services import account_service

router = APIRouter(prefix="/accounts", tags=["accounts"])


def _get_owned(db: Session, account_id: UUID, user_id) -> Account:
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.get("")
def list_accounts(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return account_service.list_accounts(user.id, db)


@router.get("/{account_id}")
def get_account(
    account_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = account_service.get_account(user.id, account_id, db)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("")
def create_account(
    data: AccountCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return account_service.create_account(user.id, data.model_dump(), db)


@router.put("/{account_id}")
def update_account(
    account_id: UUID,
    data: AccountUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = _get_owned(db, account_id, user.id)
    return account_service.update_account(account, data.model_dump(exclude_unset=True), db)


@router.post("/{account_id}/set-default")
def set_default_account(
    account_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return account_service.set_default_account(user.id, account_id, db)


@router.delete("/{account_id}")
def delete_account(
    account_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = _get_owned(db, account_id, user.id)
    account_service.delete_account(account, db)
    return {"message": "Deleted"}
