-- ============================================================
-- AIBI-DSS Database Schema
-- 11 tables · PostgreSQL 16 + pgvector
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 1. users ─────────────────────────────────────────────────
CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    full_name    VARCHAR(100)  NOT NULL,
    email        VARCHAR(150)  UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role         VARCHAR(20)   NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
    is_active    BOOLEAN       DEFAULT TRUE,
    created_at   TIMESTAMP     DEFAULT NOW(),
    updated_at   TIMESTAMP     DEFAULT NOW()
);

-- ── 2. customers ─────────────────────────────────────────────
CREATE TABLE customers (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150),
    phone      VARCHAR(20),
    address    TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ── 3. suppliers ─────────────────────────────────────────────
CREATE TABLE suppliers (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    email          VARCHAR(150),
    phone          VARCHAR(20),
    address        TEXT,
    created_at     TIMESTAMP DEFAULT NOW()
);

-- ── 4. products ──────────────────────────────────────────────
CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(150)  NOT NULL,
    sku         VARCHAR(50)   UNIQUE NOT NULL,
    category    VARCHAR(100),
    unit_price  DECIMAL(12,2) NOT NULL,
    cost_price  DECIMAL(12,2),
    description TEXT,
    is_active   BOOLEAN       DEFAULT TRUE,
    created_at  TIMESTAMP     DEFAULT NOW(),
    updated_at  TIMESTAMP     DEFAULT NOW()
);

-- ── 5. inventory ─────────────────────────────────────────────
CREATE TABLE inventory (
    id                BIGSERIAL PRIMARY KEY,
    product_id        BIGINT  NOT NULL REFERENCES products(id),
    quantity_in_stock INT     NOT NULL DEFAULT 0,
    reorder_level     INT     NOT NULL DEFAULT 10,
    supplier_id       BIGINT  REFERENCES suppliers(id),
    last_restocked_at TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT NOW()
);

-- ── 6. orders ────────────────────────────────────────────────
CREATE TABLE orders (
    id           BIGSERIAL PRIMARY KEY,
    customer_id  BIGINT REFERENCES customers(id),
    order_date   TIMESTAMP     NOT NULL DEFAULT NOW(),
    status       VARCHAR(30)   NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_by   BIGINT        REFERENCES users(id),
    notes        TEXT,
    created_at   TIMESTAMP     DEFAULT NOW(),
    updated_at   TIMESTAMP     DEFAULT NOW()
);

-- ── 7. order_items ───────────────────────────────────────────
CREATE TABLE order_items (
    id         BIGSERIAL PRIMARY KEY,
    order_id   BIGINT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT        NOT NULL REFERENCES products(id),
    quantity   INT           NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal   DECIMAL(12,2) NOT NULL
);

-- ── 8. expenses ──────────────────────────────────────────────
CREATE TABLE expenses (
    id           BIGSERIAL PRIMARY KEY,
    category     VARCHAR(100)  NOT NULL,
    amount       DECIMAL(12,2) NOT NULL,
    description  TEXT,
    expense_date DATE          NOT NULL,
    recorded_by  BIGINT        REFERENCES users(id),
    created_at   TIMESTAMP     DEFAULT NOW()
);

-- ── 9. forecasts ─────────────────────────────────────────────
CREATE TABLE forecasts (
    id            BIGSERIAL PRIMARY KEY,
    forecast_type VARCHAR(50)   NOT NULL,
    generated_at  TIMESTAMP     DEFAULT NOW(),
    period_start  DATE          NOT NULL,
    period_end    DATE          NOT NULL,
    forecast_data JSONB         NOT NULL,
    model_metrics JSONB,
    shap_summary  JSONB,
    created_by    BIGINT        REFERENCES users(id)
);

-- ── 10. health_scores ────────────────────────────────────────
CREATE TABLE health_scores (
    id               BIGSERIAL PRIMARY KEY,
    overall_score    DECIMAL(5,2) NOT NULL,
    component_scores JSONB        NOT NULL,
    explanations     JSONB        NOT NULL,
    recommendations  JSONB,
    generated_at     TIMESTAMP    DEFAULT NOW()
);

-- ── 11. document_chunks (RAG) ────────────────────────────────
CREATE TABLE document_chunks (
    id          BIGSERIAL PRIMARY KEY,
    source_type VARCHAR(50)  NOT NULL,
    source_id   VARCHAR(100),
    content     TEXT         NOT NULL,
    embedding   VECTOR(384)  NOT NULL,
    metadata    JSONB,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- IVFFlat index for cosine similarity search
-- NOTE: Requires ≥100 rows before it becomes effective.
-- For dev/testing with few rows, pgvector falls back to sequential scan.
CREATE INDEX idx_chunks_embedding ON document_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Seed: default admin user ─────────────────────────────────
-- Password: Admin@123 (BCrypt hash)
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
    'Admin User',
    'admin@aibi.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN'
);
