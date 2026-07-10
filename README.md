# AIBI-DSS — AI Business Intelligence & Decision Support System

> _"Transforming Business Data into Intelligent Decisions."_

A single-tenant web platform that consolidates Sales, Inventory, and Finance data into one system, layered with three deep AI features: Sales Forecasting, Explainable Business Health Score, and a RAG-based Natural-Language Business Assistant.

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | React 19 · TypeScript · Tailwind CSS v4 · Recharts |
| Backend    | Spring Boot 3.4 · Java 21 · Spring Security (JWT) |
| Database   | PostgreSQL 16 + pgvector                          |
| AI Service | Python · FastAPI · Prophet · SHAP · sentence-transformers |
| LLM        | Google Gemini API (RAG answer generation only)    |
| Infra      | Docker Compose                                    |

## Quick Start

```bash
# 1. Start PostgreSQL (with pgvector)
docker compose up -d

# 2. Start the Spring Boot backend
cd backend
./gradlew bootRun

# 3. Start the AI service
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 4. Start the React frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
AIBI/
├── backend/        → Spring Boot REST API (Java 21, Gradle)
├── ai-service/     → FastAPI AI microservice (Python 3.10+)
├── frontend/       → React + TypeScript SPA
├── db/             → Database init scripts
└── docker-compose.yml
```

## Final Year Project — CSBS

**Scope**: Authentication, Sales, Inventory, Finance-lite, Dashboard, Reports + 3 AI features  
**Deliberately out of scope**: Multi-tenancy, churn prediction, recommendation engine, LSTM upgrade
