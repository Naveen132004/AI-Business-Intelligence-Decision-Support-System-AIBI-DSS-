# AIBI-DSS — AI Business Intelligence & Decision Support System

<p align="center">
  <b>Transforming Raw Enterprise Data into Real-Time Intelligent Decisions</b><br>
  An enterprise-grade, full-stack Business Intelligence and Decision Support Platform powered by Modern Web Technologies and AI Microservices.
</p>

---

## 🌟 Overview

**AIBI-DSS** is a comprehensive full-stack platform designed to bridge the gap between traditional enterprise resource planning (ERP) and next-generation Artificial Intelligence. By unifying **Sales**, **Inventory**, **Order Management**, **Customer Relationships**, and **Supplier Tracking** into a single cohesive system, AIBI-DSS provides decision-makers with actionable, data-driven insights.

The platform features a modern, responsive **dark-themed Single Page Application (SPA)** built with React 19 and TypeScript, backed by a high-performance **Spring Boot 3 REST API** secured via JSON Web Tokens (JWT), and integrated with a dedicated **Python/FastAPI AI Microservice** for advanced predictive analytics and natural language business queries.

---

## 🏛️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND LAYER                                    |
|   React 19 + TypeScript + Vite + Tailwind CSS / Vanilla Dark Theme + Recharts     |
+-----------------------------------------------------------------------------------+
       ^                                                                   ^
       | HTTP REST / JWT                                                   | HTTP / JSON
       v                                                                   v
+---------------------------------------------+     +-------------------------------+
|                 BACKEND API                 |     |          AI SERVICE           |
|    Spring Boot 3.4 + Java 17/21 + Spring    |<--->|   FastAPI + Python 3.10+      |
|    Security + JPA/Hibernate + Validation    |     |   Prophet / SHAP / RAG + LLM  |
+---------------------------------------------+     +-------------------------------+
       ^                                                           ^
       | JDBC / JPA                                                | pgvector / SQL
       v                                                           v
+-----------------------------------------------------------------------------------+
|                               DATABASE LAYER                                      |
|                  PostgreSQL 16 + pgvector Vector Database                         |
+-----------------------------------------------------------------------------------+
```

---

## 🛠️ Technology Stack

| Component | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts |
| **Backend API** | Java 17/21, Spring Boot 3.4, Spring Security, Spring Data JPA, JWT Authentication |
| **AI Microservice**| Python 3.10+, FastAPI, Uvicorn, Prophet (Time-series Forecasting), Sentence-Transformers (Embeddings), Google Gemini SDK (LLM Generation) |
| **Database** | PostgreSQL 16, `pgvector` extension (for vector embeddings and RAG search) |
| **Infrastructure** | Docker, Docker Compose, Gradle (Wrapper) |

---

## ✨ Core Features & Modules

### 1. 🔐 Authentication & Security (`/api/auth`, `/api/users`)
* **JWT-Based Authentication**: Secure stateless login (`/api/auth/login`) and registration (`/api/auth/register`).
* **Role-Based Access Control (RBAC)**: Support for `ROLE_ADMIN` and `ROLE_USER` permissions across endpoints.
* **Profile & Security Management**: Update personal profile details and change passwords securely.

### 2. 📊 Executive Dashboard & Analytics (`/api/dashboard`)
* **Real-Time KPIs**: Instant metrics on total revenue, total orders, active customers, and critical inventory alerts.
* **Sales Growth Analytics**: Automated calculation of period-over-period growth percentages.
* **Interactive Visualizations**: Dynamic charts rendering historical sales performance and trends.

### 3. 📦 Product Management (`/api/products`)
* **Full CRUD Operations**: Create, read, update, and archive product catalog items.
* **Price & SKU Tracking**: Maintain unique SKU codes, categorization, pricing models, and stock levels.
* **Low Stock Indicators**: Visual warning badges when product stock falls below designated thresholds.

### 4. 🛒 Order & Sales Processing (`/api/orders`)
* **Multi-Item Order Workflow**: Place complex orders across multiple products with real-time stock deductions.
* **Order Lifecycle Management**: Track and update order statuses (`PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`).
* **Customer Attribution**: Link every transaction directly to customer profiles for lifetime value tracking.

### 5. 👥 Customer Relationship Management (`/api/customers`)
* **Customer Profiles**: Store detailed contact information, phone numbers, addresses, and custom notes.
* **Loyalty & Tier Status**: Categorize customers (`REGULAR`, `SILVER`, `GOLD`, `PLATINUM`) based on engagement.

### 6. 🏭 Supplier Management (`/api/suppliers`)
* **Supplier Directory**: Manage vendor details, primary contact persons, email addresses, and phone numbers.
* **Performance Metrics**: Track average lead times (days) and supplier quality ratings (`1.0` to `5.0`).

### 7. 📈 Inventory & Stock Control (`/api/inventory`)
* **Real-Time Stock Auditing**: Monitor warehouse quantities, reorder thresholds, and warehouse location codes.
* **Stock Adjustments & Logging**: Perform audit adjustments (`ADD`, `SUBTRACT`, `SET`) with mandatory reason tracking.

### 8. 📈 Sales Forecasting (`/api/forecast`)
* **Prophet Time-Series Model**: Demand prediction using Facebook Prophet trained on historical order data.
* **Confidence Intervals**: Upper and lower bound forecasts for risk-aware planning.
* **SHAP Component Importance**: Explainable breakdown of which factors influence the forecast.

### 9. 💓 Business Health Score (`/api/health-score`)
* **Composite Health Assessment**: Weighted score across Sales Performance, Revenue Growth, Inventory Health, and Expense Efficiency.
* **SHAP-Inspired Explanations**: Each component scored 0–100 with detailed natural-language explanations.
* **Actionable Recommendations**: Priority-ranked suggestions (HIGH / MEDIUM / LOW) based on weak areas.

### 10. 🤖 RAG Business Assistant (`/api/assistant`)
* **Natural Language Queries**: Ask free-form questions about sales, inventory, customers, orders, suppliers, and expenses.
* **Vector Search (pgvector)**: Business data is embedded with `sentence-transformers` (all-MiniLM-L6-v2) and stored as 384-dim vectors for cosine similarity retrieval.
* **Gemini LLM Generation**: Retrieved context is sent to Google Gemini (`gemini-2.0-flash`) for intelligent, data-grounded answers.
* **Source Citations**: Every answer includes the source data chunks with relevance scores for full transparency.
* **One-Click Data Sync**: Re-index all 6 business tables into the vector store with a single API call.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Docker & Docker Compose** (required for PostgreSQL + `pgvector`)
* **Java 17 or Java 21** (for Spring Boot backend)
* **Node.js 18+** (for React frontend)
* **Python 3.10+** (for AI service)

### Step 1: Start Database (PostgreSQL + pgvector)
```bash
docker compose up -d
```
*Runs PostgreSQL on `localhost:5432` with database `aibi_dss`, user `postgres`, and password `postgres`.*

### Step 2: Start Spring Boot Backend API
```bash
cd backend
# On Windows PowerShell / CMD:
.\gradlew.bat bootRun

# On macOS / Linux:
./gradlew bootRun
```
*Backend API server will start on **`http://localhost:8080`**.*

### Step 3: Start React Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend application will start on **`http://localhost:5173`**.*

### Step 4: Start AI Microservice (Optional / For AI features)
```bash
cd ai-service
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*AI service API will start on **`http://localhost:8000`**.*

#### RAG Assistant Setup (requires Gemini API key)
Create a `.env` file in the `ai-service/` directory:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey). The embedding model (`all-MiniLM-L6-v2`) runs locally — no API key needed for embeddings.

---

## 🌐 Deployment

The whole stack runs on one server with Docker Compose (`docker-compose.prod.yml`): nginx serves the
React build and proxies `/api` to Spring Boot, with the AI service and PostgreSQL + pgvector on the
internal network. Step-by-step instructions (Oracle Cloud Always Free or any VPS, HTTPS, backups) are in
**[DEPLOY.md](DEPLOY.md)**.

---

## 📡 REST API Reference Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| **Auth** | `POST` | `/api/auth/register` | Register a new user account |
| **Dashboard** | `GET` | `/api/dashboard/stats` | Fetch aggregated KPIs and sales charts |
| **Products** | `GET / POST` | `/api/products` | Retrieve all products or create new product |
| **Products** | `PUT / DELETE` | `/api/products/{id}` | Update or delete a specific product |
| **Orders** | `GET / POST` | `/api/orders` | Retrieve order history or place a new order |
| **Orders** | `PATCH` | `/api/orders/{id}/status` | Update order processing status |
| **Customers** | `GET / POST` | `/api/customers` | Manage customer profiles and loyalty tiers |
| **Suppliers** | `GET / POST` | `/api/suppliers` | Manage vendor directory and performance ratings |
| **Inventory** | `GET / POST` | `/api/inventory` | Check stock levels or create inventory record |
| **Inventory** | `POST` | `/api/inventory/{id}/adjust` | Perform stock quantity adjustment |
| **Expenses** | `GET / POST` | `/api/expenses` | Manage business expenses with category tracking |
| **Forecast** | `POST` | `/api/forecast/generate` | Generate sales forecast using Prophet |
| **Forecast** | `GET` | `/api/forecast/latest` | Retrieve the most recent forecast |
| **Health Score** | `POST` | `/api/health-score/calculate` | Calculate composite business health score |
| **Health Score** | `GET` | `/api/health-score/latest` | Retrieve the latest health score |
| **Assistant** | `POST` | `/api/assistant/ask` | Ask a natural-language business question (RAG) |
| **Assistant** | `POST` | `/api/assistant/sync` | Sync (re-index) all business data into vector store |
| **Assistant** | `GET` | `/api/assistant/status` | Get RAG index status and chunk count |
| **Users** | `GET / PUT` | `/api/users/profile` | View or update current user profile |

---

## 📁 Repository Structure

```
AIBI/
├── backend/                  → Spring Boot 3.4 Backend REST API
│   ├── src/main/java/com/aibi/
│   │   ├── assistant/        → RAG assistant proxy controller
│   │   ├── auth/             → Authentication controllers & JWT services
│   │   ├── config/           → Security, JWT filter, & CORS configuration
│   │   ├── customer/         → Customer entity, repository, & services
│   │   ├── dashboard/        → Analytics aggregation & KPI calculation
│   │   ├── expense/          → Expense tracking & category analytics
│   │   ├── forecast/         → Forecast proxy controller
│   │   ├── healthscore/      → Health score proxy controller
│   │   ├── inventory/        → Inventory tracking & stock adjustment logic
│   │   ├── order/            → Order processing & order item management
│   │   ├── product/          → Product catalog management
│   │   ├── supplier/         → Vendor management & rating tracking
│   │   └── user/             → User administration & profile services
│   └── build.gradle          → Gradle build definitions
├── frontend/                 → React 19 + TypeScript SPA
│   ├── src/
│   │   ├── components/       → Reusable UI (Sidebar, AppLayout, Modal, StatusBadge, EmptyState)
│   │   ├── context/          → AuthContext state management
│   │   ├── pages/            → Dashboard, Products, Orders, Customers, Inventory, Suppliers,
│   │   │                       Expenses, Forecast, HealthScore, Assistant, Profile
│   │   ├── services/         → Typed Axios API clients for all endpoints
│   │   └── types/            → TypeScript domain interfaces
│   └── package.json          → NPM dependencies & scripts
├── ai-service/               → FastAPI AI Microservice
│   ├── app/
│   │   ├── forecasting/      → Prophet sales forecasting engine
│   │   ├── health_score/     → Composite health scoring with explanations
│   │   └── rag/              → RAG assistant: embeddings, vector search, Gemini LLM
│   └── requirements.txt      → Python dependencies
├── db/                       → Database initialization & pgvector setup scripts
│   └── init.sql              → Schema creation (11 tables) & seed data
├── docker-compose.yml        → Docker infrastructure setup
└── README.md                 → Project documentation
```

---

## 🎓 Academic & Project Scope

This project is developed as a **Final Year Project (Computer Science & Business Systems - CSBS)**.
* **Included Scope**: Enterprise Auth, Sales, Inventory, Order Management, Customer & Supplier CRM, Real-time Dashboard, plus 3 deep AI/ML capabilities (Forecasting, Explainable Scoring, and RAG Assistant).
* **Out of Scope**: Multi-tenancy, real-time payment gateway processing, native mobile apps.

