"""CSV import for transactions."""

import csv
import io
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.transaction import Transaction


def import_transactions_csv(user_id, content: bytes, db: Session) -> dict:
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")

    reader = csv.DictReader(io.StringIO(text))
    imported = 0
    errors = []

    for i, row in enumerate(reader, start=2):
        try:
            normalized = {k.strip().lower(): v.strip() for k, v in row.items() if k}

            tx_type = normalized.get("type", "expense").lower()
            if tx_type not in ("income", "expense"):
                tx_type = "expense"

            amount_str = normalized.get("amount", "0").replace(",", "")
            amount = float(amount_str)
            if amount <= 0:
                errors.append({"row": i, "error": "Amount must be positive"})
                continue

            date_str = normalized.get("date", "")
            tx_date = None
            for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"):
                try:
                    tx_date = datetime.strptime(date_str, fmt).date()
                    break
                except ValueError:
                    continue
            if not tx_date:
                errors.append({"row": i, "error": f"Invalid date: {date_str!r}"})
                continue

            description = normalized.get("description", "").strip()
            if not description:
                errors.append({"row": i, "error": "Description is required"})
                continue

            category = normalized.get("category", "other").strip().lower() or "other"
            notes = normalized.get("notes", "").strip() or None

            db.add(Transaction(
                user_id=user_id,
                type=tx_type,
                amount=amount,
                description=description,
                category=category,
                date=tx_date,
                notes=notes,
            ))
            imported += 1
        except Exception as exc:
            errors.append({"row": i, "error": str(exc)})

    if imported > 0:
        db.commit()

    return {"imported": imported, "errors": errors[:20]}
