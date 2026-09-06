from sqlalchemy.orm import Session

from app.models.dismissed_notification import DismissedNotification


def _get_dismissed_ids(user_id, db: Session) -> set[str]:
    rows = (
        db.query(DismissedNotification.notification_id)
        .filter(DismissedNotification.user_id == user_id)
        .all()
    )
    return {r[0] for r in rows}


def filter_dismissed(items: list[dict], dismissed_ids: set[str]) -> list[dict]:
    return [item for item in items if item["id"] not in dismissed_ids]


def _dismiss(user_id, notification_id: str, db: Session) -> None:
    exists = (
        db.query(DismissedNotification)
        .filter(
            DismissedNotification.user_id == user_id,
            DismissedNotification.notification_id == notification_id,
        )
        .first()
    )
    if not exists:
        db.add(DismissedNotification(user_id=user_id, notification_id=notification_id))
        db.commit()


def mark_read(user_id, notification_id: str, db: Session) -> None:
    _dismiss(user_id, notification_id, db)


def mark_all_read(user_id, db: Session) -> None:
    from app.services.notification_service import get_notifications

    data = get_notifications(user_id, db, include_dismissed=True)
    for item in data["items"]:
        if not item["read"]:
            mark_read(user_id, item["id"], db)
