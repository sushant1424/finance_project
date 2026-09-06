#!/usr/bin/env python3
"""Seed FinSight database with demo user and rich sample data."""
from datetime import date, timedelta
from decimal import Decimal
import random

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.transaction import Transaction
from app.models.budget import Budget
from app.models.goal import Goal
from app.models.goal_contribution import GoalContribution

EMAIL = "test@gmail.com"
PASSWORD = "Test123456"
NAME = "Test User"

EXPENSE_TEMPLATES = [
    ("food", "Lunch at Himalayan Cafe", 450), ("food", "Grocery - Bhatbhateni", 3200),
    ("food", "Coffee with friends", 280), ("food", "Dinner delivery", 890),
    ("food", "Weekend brunch", 1200), ("food", "Momos and chiya", 350),
    ("food", "Unusual fine dining", 8500), ("transport", "Taxi to office", 350),
    ("transport", "Petrol refill", 4500), ("transport", "Bus pass", 1500),
    ("transport", "Pathao ride", 220), ("housing", "Room rent", 15000),
    ("housing", "Electricity bill", 2800), ("entertainment", "Netflix", 1200),
    ("entertainment", "Movie tickets", 800), ("entertainment", "Concert tickets", 2500),
    ("health", "Pharmacy", 650), ("health", "Doctor visit", 1500),
    ("shopping", "New shoes", 4500), ("shopping", "Clothes", 3200),
    ("utilities", "Internet bill", 1500), ("utilities", "Water bill", 400),
    ("education", "Online course", 3500), ("personal", "Haircut", 500),
    ("travel", "Flight to Pokhara", 12000), ("travel", "Hotel booking", 4500),
]

BUDGET_LIMITS = [
    ("food", 8000), ("transport", 5000), ("housing", 18000),
    ("entertainment", 3000), ("shopping", 5000), ("utilities", 2500),
    ("health", 4000), ("travel", 6000),
]


def _month_offset(today: date, offset: int):
    m = today.month - offset
    y = today.year
    while m <= 0:
        m += 12
        y -= 1
    return m, y


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == EMAIL).first()
        if user:
            goal_ids = [row[0] for row in db.query(Goal.id).filter(Goal.user_id == user.id).all()]
            if goal_ids:
                db.query(GoalContribution).filter(GoalContribution.goal_id.in_(goal_ids)).delete(synchronize_session=False)
            db.query(Transaction).filter(Transaction.user_id == user.id).delete()
            db.query(Budget).filter(Budget.user_id == user.id).delete()
            db.query(Goal).filter(Goal.user_id == user.id).delete()
            user.password_hash = get_password_hash(PASSWORD)
            user.name = NAME
        else:
            user = User(name=NAME, email=EMAIL, password_hash=get_password_hash(PASSWORD), currency="NPR")
            db.add(user)
            db.flush()

        today = date.today()
        random.seed(42)

        # ~6 months of daily expenses
        for i in range(180):
            d = today - timedelta(days=i)
            if random.random() < 0.55:
                cat, desc, base = random.choice(EXPENSE_TEMPLATES)
                amount = Decimal(str(max(50, base + random.randint(-150, 300))))
                db.add(Transaction(
                    user_id=user.id, type="expense", amount=amount,
                    description=desc, category=cat, date=d,
                ))

        # Monthly salary + occasional income for 8 months
        for offset in range(8):
            m, y = _month_offset(today, offset)
            pay_day = min(5, 28)
            try:
                d = date(y, m, pay_day)
            except ValueError:
                d = date(y, m, 28)
            if d <= today:
                db.add(Transaction(user_id=user.id, type="income", amount=Decimal("85000"),
                                   description="Monthly salary", category="salary", date=d))
            if offset % 2 == 0 and d <= today:
                db.add(Transaction(user_id=user.id, type="income", amount=Decimal(str(15000 + random.randint(0, 15000))),
                                   description="Freelance project", category="freelance", date=d + timedelta(days=10)))
            if offset % 3 == 0 and d <= today:
                db.add(Transaction(user_id=user.id, type="income", amount=Decimal("8000"),
                                   description="Side business", category="business", date=d + timedelta(days=15)))

        db.flush()

        # Budgets for current + 2 prior months
        for offset in range(3):
            m, y = _month_offset(today, offset)
            for cat, limit in BUDGET_LIMITS:
                db.add(Budget(user_id=user.id, category=cat, monthly_limit=Decimal(str(limit)), month=m, year=y))

        goals_data = [
            ("Emergency Fund", 100000, 52000, "🛡️", "#06b6d4", 200),
            ("New Laptop", 120000, 45000, "💻", "#a855f7", 150),
            ("Nepal Trek", 80000, 22000, "🏔️", "#22c55e", 120),
            ("Wedding Fund", 500000, 180000, "💍", "#f59e0b", 365),
            ("Motorcycle", 350000, 95000, "🏍️", "#ef4444", 300),
        ]
        for name, target, current, icon, color, days in goals_data:
            g = Goal(user_id=user.id, name=name, target_amount=Decimal(str(target)),
                     current_amount=Decimal(str(current)), target_date=today + timedelta(days=days),
                     icon=icon, color=color)
            db.add(g)
            db.flush()
            for j in range(5):
                db.add(GoalContribution(
                    goal_id=g.id, amount=Decimal(str(3000 + j * 2500)),
                    note=f"Monthly save #{j + 1}", date=today - timedelta(days=30 * j),
                ))

        db.commit()
        tx_count = db.query(Transaction).filter(Transaction.user_id == user.id).count()
        print(f"Seeded user: {EMAIL} / {PASSWORD}")
        print(f"Transactions: {tx_count}")
        print(f"Budgets: {db.query(Budget).filter(Budget.user_id == user.id).count()}")
        print(f"Goals: {db.query(Goal).filter(Goal.user_id == user.id).count()}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
