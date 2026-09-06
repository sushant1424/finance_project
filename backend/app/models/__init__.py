"""Register all SQLAlchemy models for create_all."""

from app.models.account import Account
from app.models.budget import Budget
from app.models.dismissed_notification import DismissedNotification
from app.models.goal import Goal
from app.models.goal_contribution import GoalContribution
from app.models.networth_snapshot import NetWorthSnapshot
from app.models.recurring_bill import RecurringBill
from app.models.transaction import Transaction
from app.models.user import User
from app.models.user_category import UserCategory

__all__ = [
    "Account",
    "Budget",
    "DismissedNotification",
    "Goal",
    "GoalContribution",
    "NetWorthSnapshot",
    "RecurringBill",
    "Transaction",
    "User",
    "UserCategory",
]
