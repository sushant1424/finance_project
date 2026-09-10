# FinSight - Smart Personal Finance & Budget Tracker

Track spending, detect unusual expenses with Z-score anomaly detection, and hit financial goals with budget pace prediction.

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

- **Dashboard** - Net balance, income/expense stats, unusual activity, recent transactions
- **Transactions** - Full CRUD with filters, sorting, bulk delete, live anomaly warnings
- **Budgets** - Monthly limits with pace prediction (on track / at risk / exceeded)
- **Goals** - Savings goals with progress rings and contribution tracking
- **Statistics** - Category breakdown, spending clusters, savings rate, unusual expenses
- **Notifications** - Budget, goal, bill, balance, and anomaly alerts

## Algorithms

1. **Z-Score Anomaly Detection** - Flags expenses with |z| >= 2 vs category mean (needs 5+ past expenses; sigma floored to avoid near-zero instability). Income and transfers are skipped.
2. **Naive Bayes Categorizer** - Suggests categories from description while you type
3. **K-Means Spending Clusters** - Groups expenses into amount tiers
4. **Budget Pace Prediction** - Projects end-of-month spend from current rate
