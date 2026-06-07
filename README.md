# FinSight — Smart Personal Finance & Budget Tracker

Track spending, detect anomalies, and hit financial goals with Z-Score anomaly detection, EWMA trend analysis, and budget pace prediction.

## Stack

- **Frontend:** React, TailwindCSS, Redux Toolkit, shadcn/ui, Recharts, React Router, Zod
- **Backend:** FastAPI, PostgreSQL, SQLAlchemy, JWT auth

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL running locally

## Database Setup

```bash
# Create database (requires PostgreSQL running)
psql -U postgres -c "CREATE DATABASE finsight;"
```

Connection: `postgresql://postgres:123@localhost/finsight`

## Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

## Demo Account

```
Email:    test@gmail.com
Password: Test123456
```

Seed data: `cd backend && source venv/bin/activate && python seed.py`

## Features

- **Dashboard** — Net balance, income/expense stats, cash flow charts, recent transactions
- **Transactions** — Full CRUD with filters, sorting, bulk delete, auto anomaly detection
- **Budgets** — Monthly limits with pace prediction (on track / at risk / exceeded)
- **Goals** — Savings goals with progress rings and contribution tracking
- **Reports** — Spending trends with EWMA, category breakdown, PDF export
- **Anomalies** — Z-Score scatter plot and severity-based alerts
- **Net Worth** — Manual asset/liability tracking with history chart

## Algorithms

1. **Z-Score Anomaly Detection** — Flags expenses >2σ from category mean
2. **EWMA Trend Analysis** — Configurable smoothing for spending trends
3. **Budget Pace Prediction** — Projects end-of-month spend from current rate
