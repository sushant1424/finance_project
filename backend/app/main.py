import logging
from threading import Thread

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    accounts,
    analytics,
    auth,
    budgets,
    categories,
    goals,
    notifications,
    recurring_bills,
    transactions,
)
from app.core.database import Base, engine
from app.core.migrate import run_migrations
import app.models  # noqa: F401 — register all models for create_all

app = FastAPI(title="FinSight API", version="1.0.0")

logger = logging.getLogger(__name__)


def initialize_database() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        run_migrations(engine)
    except Exception:
        logger.exception("Database initialization failed during startup")


@app.on_event("startup")
def schedule_database_initialization() -> None:
    Thread(target=initialize_database, daemon=True).start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(accounts.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(budgets.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(recurring_bills.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
