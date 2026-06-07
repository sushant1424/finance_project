from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analytics, anomalies, auth, budgets, goals, networth, notifications, transactions
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinSight API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(budgets.router, prefix="/api")
app.include_router(goals.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(anomalies.router, prefix="/api")
app.include_router(networth.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
