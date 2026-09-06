"""Lightweight column migrations for dev (no Alembic)."""

from sqlalchemy import text
from sqlalchemy.engine import Engine

def run_migrations(engine: Engine) -> None:
    try:
        with engine.begin() as conn:
            # Native PostgreSQL IF NOT EXISTS - runs instantly without deadlocks
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP"))
            conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP"))
            conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_id UUID"))
            conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS to_account_id UUID"))
            conn.execute(text("ALTER TABLE recurring_bills ADD COLUMN IF NOT EXISTS due_day INTEGER"))

            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name VARCHAR NOT NULL,
                    type VARCHAR NOT NULL DEFAULT 'cash',
                    color VARCHAR DEFAULT '#6366f1',
                    is_default BOOLEAN DEFAULT FALSE,
                    opening_balance NUMERIC(12, 2) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """))
            conn.execute(text(
                "ALTER TABLE accounts ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(12, 2) DEFAULT 0"
            ))
            conn.execute(text(
                "ALTER TABLE budgets ADD COLUMN IF NOT EXISTS rollover BOOLEAN DEFAULT FALSE"
            ))
            conn.execute(text(
                "ALTER TABLE goals ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active'"
            ))
            conn.execute(text(
                "ALTER TABLE goals ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP"
            ))
            conn.execute(text(
                "ALTER TABLE goal_contributions ADD COLUMN IF NOT EXISTS account_id UUID"
            ))
            conn.execute(text(
                "ALTER TABLE goal_contributions ADD COLUMN IF NOT EXISTS transaction_id UUID"
            ))

            conn.execute(text("""
                INSERT INTO accounts (id, user_id, name, type, is_default)
                SELECT gen_random_uuid(), u.id, 'Cash', 'cash', TRUE
                FROM users u
                WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.user_id = u.id)
            """))
            conn.execute(text("""
                UPDATE transactions t
                SET account_id = a.id
                FROM accounts a
                WHERE t.account_id IS NULL
                  AND t.user_id = a.user_id
                  AND a.is_default = TRUE
            """))
    except Exception as e:
        print(f"Migration notice: {e}")
