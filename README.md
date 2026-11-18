# BizCore

Multi-tenant SaaS POS platform (Phase 1: project foundation).

## Stack

- FastAPI + Uvicorn
- PostgreSQL 16 + SQLAlchemy 2.0
- Alembic migrations
- Docker Compose for the database

## Setup

```bash
# 1. Create and activate a virtual environment
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1    # Windows PowerShell
# source venv/bin/activate     # macOS / Linux

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy the environment template and adjust values
copy .env.example .env

# 4. Start PostgreSQL
cd ..
docker compose up -d

# 5. Run migrations
cd backend
alembic upgrade head

# 6. Start the API
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health` — API liveness
- `GET /api/v1/health/db` — database connectivity
- Swagger UI: <http://localhost:8000/docs>
