# 🚀 BrizCore

A modular, full-stack enterprise platform built with modern technologies.

## 🧱 Architecture & Tech Stack

- **Web Application**: React 19 + Vite + Tailwind CSS + Recharts + Axios
- **Mobile Application**: React Native (JavaScript) + React Navigation + AsyncStorage + Axios
- **Backend API**: Python 3.13 + FastAPI + Uvicorn
- **Database & ORM**: PostgreSQL + SQLAlchemy + Alembic migrations
- **Authentication & Security**: JWT Access Tokens + Refresh Tokens + Role-Based Access Control (RBAC) + Bcrypt
- **Containerization & Deployment**: Docker + Docker Compose + Nginx

---

## 📁 Repository Layout

```
BrizCore/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/v1/           # API routes & endpoints
│   │   ├── core/             # Configuration, JWT security & RBAC
│   │   ├── db/               # Database engine & session
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic layer
│   │   └── main.py           # Application entrypoint
│   ├── alembic/              # Database migration scripts
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile
│   └── .env
│
├── web/                      # React.js Web Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # Axios API client with token refresh
│   │   ├── store/            # State management
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── mobile/                   # React Native Mobile App
│   ├── src/
│   │   ├── components/       # Native UI components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation stacks & tabs
│   │   └── services/         # Axios API client
│   ├── package.json
│   └── App.jsx
│
├── docker-compose.yml        # Multi-container local orchestration
└── .gitignore
```

---

## ⚡ Getting Started

### 1. Backend (FastAPI)
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\Activate.ps1    # Windows PowerShell
# source venv/bin/activate     # Linux / macOS

# Start server
uvicorn app.main:app --reload --port 8000
```
Swagger API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Web Frontend (React + Vite)
```bash
cd web
npm run dev
```
Local URL: [http://localhost:5173](http://localhost:5173)

### 3. Mobile Application (React Native)
```bash
cd mobile
npm run android   # Android emulator or device
# npm run start   # Start Metro bundler
```

### 4. Running with Docker Compose
```bash
docker compose up --build
```
