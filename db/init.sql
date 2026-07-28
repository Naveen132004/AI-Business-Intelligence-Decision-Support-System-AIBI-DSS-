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

-- ════════════════════════════════════════════════════════════
-- SEED DATA — Products, Customers, Orders
-- ════════════════════════════════════════════════════════════

-- ── Products (10 items, 4 categories) ───────────────────────
INSERT INTO products (name, sku, category, unit_price, cost_price, description) VALUES
('MacBook Pro 16"',      'ELEC-001', 'Electronics',     249999.00, 210000.00, 'Apple MacBook Pro 16-inch M3 Pro, 18GB RAM, 512GB SSD'),
('Dell UltraSharp 27"',  'ELEC-002', 'Electronics',      42999.00,  35000.00, '27-inch 4K USB-C Monitor with HDR'),
('Logitech MX Master 3', 'ELEC-003', 'Electronics',       8999.00,   6500.00, 'Advanced wireless mouse for productivity'),
('Herman Miller Aeron',  'FURN-001', 'Furniture',        129900.00, 100000.00, 'Ergonomic office chair, size B, graphite'),
('Standing Desk Pro',    'FURN-002', 'Furniture',         45999.00,  32000.00, 'Electric height-adjustable standing desk, 60x30 inches'),
('MS Office 365 Business','SOFT-001','Software',           8999.00,   7200.00, 'Annual subscription per user — Word, Excel, PowerPoint, Teams'),
('Adobe Creative Cloud',  'SOFT-002','Software',          54999.00,  48000.00, 'Annual all-apps plan — Photoshop, Illustrator, Premiere Pro'),
('A4 Copy Paper (5 Ream)','OFFC-001','Office Supplies',    1499.00,   1100.00, 'White 80gsm multipurpose paper, 2500 sheets'),
('Whiteboard 4x3 ft',    'OFFC-002','Office Supplies',    3499.00,   2400.00, 'Magnetic dry-erase whiteboard with markers and eraser'),
('Wireless Presenter',   'OFFC-003','Office Supplies',    2999.00,   2000.00, 'Laser pointer with USB receiver for presentations');

-- ── Customers ───────────────────────────────────────────────
INSERT INTO customers (name, email, phone, address) VALUES
('TechCorp Solutions',   'procurement@techcorp.in',   '+91 98765 43210', '42 MG Road, Bengaluru, Karnataka 560001'),
('GreenLeaf Organics',   'orders@greenleaf.co.in',    '+91 87654 32109', '15 Anna Salai, Chennai, Tamil Nadu 600002'),
('Pinnacle Consulting',  'admin@pinnacle.com',        '+91 76543 21098', '88 Connaught Place, New Delhi 110001'),
('BlueWave Media',       'purchase@bluewave.in',      '+91 65432 10987', '23 FC Road, Pune, Maharashtra 411004'),
('Sunrise Healthcare',   'supplies@sunrise-health.in','+91 54321 09876', '7 Park Street, Kolkata, West Bengal 700016');

-- ── Orders (20 orders, spread over 6 months) ────────────────
INSERT INTO orders (customer_id, order_date, status, total_amount, created_by, notes) VALUES
(1, NOW() - INTERVAL '170 days', 'DELIVERED',  508997.00, 1, 'Initial office setup for new Bengaluru branch'),
(2, NOW() - INTERVAL '155 days', 'DELIVERED',   17997.00, 1, 'Quarterly stationery order'),
(3, NOW() - INTERVAL '140 days', 'DELIVERED',  249999.00, 1, 'Laptop for senior consultant'),
(1, NOW() - INTERVAL '125 days', 'DELIVERED',   45999.00, 1, 'Standing desk for CTO'),
(4, NOW() - INTERVAL '110 days', 'DELIVERED',   63998.00, 1, 'Software licenses renewal'),
(5, NOW() - INTERVAL '100 days', 'DELIVERED',   42999.00, 1, 'Monitor for reception area'),
(2, NOW() - INTERVAL '90 days',  'DELIVERED',  129900.00, 1, 'Ergonomic chairs for team'),
(3, NOW() - INTERVAL '80 days',  'DELIVERED',   26997.00, 1, 'Office mice for dev team'),
(1, NOW() - INTERVAL '70 days',  'DELIVERED',    4498.00, 1, 'Paper and whiteboard supplies'),
(4, NOW() - INTERVAL '60 days',  'SHIPPED',     54999.00, 1, 'Creative suite for design team'),
(5, NOW() - INTERVAL '50 days',  'SHIPPED',    249999.00, 1, 'MacBook for head doctor'),
(2, NOW() - INTERVAL '42 days',  'SHIPPED',      8999.00, 1, 'Office 365 subscription'),
(3, NOW() - INTERVAL '35 days',  'CONFIRMED',   91998.00, 1, 'Two standing desks'),
(1, NOW() - INTERVAL '28 days',  'CONFIRMED',   42999.00, 1, 'Monitor for new hire'),
(4, NOW() - INTERVAL '21 days',  'CONFIRMED',    8999.00, 1, 'Wireless mouse'),
(5, NOW() - INTERVAL '14 days',  'PENDING',      5997.00, 1, 'Presentation equipment'),
(2, NOW() - INTERVAL '10 days',  'PENDING',    249999.00, 1, 'New MacBook for manager'),
(3, NOW() - INTERVAL '7 days',   'PENDING',     12497.00, 1, 'Office supplies restocking'),
(1, NOW() - INTERVAL '3 days',   'PENDING',    175898.00, 1, 'Furniture for new conference room'),
(4, NOW() - INTERVAL '1 day',    'PENDING',      8999.00, 1, 'Software subscription');

-- ── Order Items ─────────────────────────────────────────────
-- Order 1: MacBook + Dell Monitor + Standing Desk
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 249999.00, 249999.00), (1, 2, 1, 42999.00, 42999.00),
(1, 5, 1, 45999.00, 45999.00),   (1, 5, 1, 45999.00, 45999.00),
(1, 8, 2, 1499.00, 2998.00),     (1, 3, 1, 8999.00, 8999.00),
(1, 9, 1, 3499.00, 3499.00),     (1, 10, 1, 2999.00, 2999.00);

-- Orders 2-20: simplified items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
(2, 8, 10, 1499.00, 14990.00),  (2, 10, 1, 2999.00, 2999.00),
(3, 1, 1, 249999.00, 249999.00),
(4, 5, 1, 45999.00, 45999.00),
(5, 6, 5, 8999.00, 44995.00),   (5, 7, 1, 54999.00, 54999.00),
(6, 2, 1, 42999.00, 42999.00),
(7, 4, 1, 129900.00, 129900.00),
(8, 3, 3, 8999.00, 26997.00),
(9, 8, 2, 1499.00, 2998.00),    (9, 9, 1, 3499.00, 3499.00),
(10, 7, 1, 54999.00, 54999.00),
(11, 1, 1, 249999.00, 249999.00),
(12, 6, 1, 8999.00, 8999.00),
(13, 5, 2, 45999.00, 91998.00),
(14, 2, 1, 42999.00, 42999.00),
(15, 3, 1, 8999.00, 8999.00),
(16, 10, 2, 2999.00, 5998.00),
(17, 1, 1, 249999.00, 249999.00),
(18, 8, 5, 1499.00, 7495.00),   (18, 9, 1, 3499.00, 3499.00),
(19, 4, 1, 129900.00, 129900.00),(19, 5, 1, 45999.00, 45999.00),
(20, 6, 1, 8999.00, 8999.00);

-- ── Suppliers ───────────────────────────────────────────────
INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES
('TechDistributors India',  'Ramesh Kumar',   'sales@techdist.in',     '+91 98765 00001', '12 Electronic City, Bengaluru'),
('OfficePro Supplies',      'Anita Sharma',   'orders@officepro.in',   '+91 98765 00002', '34 Industrial Area, Noida'),
('FurnitureWorld',           'Vikram Singh',   'bulk@furnitureworld.in','+91 98765 00003', '56 MIDC, Pune'),
('SoftLicense Hub',          'Priya Patel',    'licensing@softlhub.in', '+91 98765 00004', '78 Whitefield, Bengaluru');

-- ── Inventory ───────────────────────────────────────────────
INSERT INTO inventory (product_id, quantity_in_stock, reorder_level, supplier_id, last_restocked_at) VALUES
(1,  15, 5,  1, NOW() - INTERVAL '10 days'),   -- MacBook Pro
(2,  22, 8,  1, NOW() - INTERVAL '15 days'),   -- Dell Monitor
(3,  45, 15, 1, NOW() - INTERVAL '7 days'),    -- Logitech Mouse
(4,   3, 5,  3, NOW() - INTERVAL '30 days'),   -- Herman Miller Chair (LOW STOCK)
(5,   8, 5,  3, NOW() - INTERVAL '20 days'),   -- Standing Desk
(6,  50, 10, 4, NOW() - INTERVAL '5 days'),    -- MS Office 365
(7,  12, 5,  4, NOW() - INTERVAL '12 days'),   -- Adobe CC
(8, 200, 50, 2, NOW() - INTERVAL '3 days'),    -- Copy Paper
(9,   2, 5,  2, NOW() - INTERVAL '45 days'),   -- Whiteboard (LOW STOCK)
(10, 30, 10, 2, NOW() - INTERVAL '8 days');    -- Wireless Presenter

-- ── Expenses ────────────────────────────────────────────────
INSERT INTO expenses (category, amount, description, expense_date, recorded_by) VALUES
('Salaries',          350000.00, 'Monthly salaries — January',        '2026-01-31', 1),
('Salaries',          350000.00, 'Monthly salaries — February',       '2026-02-28', 1),
('Salaries',          350000.00, 'Monthly salaries — March',          '2026-03-31', 1),
('Salaries',          350000.00, 'Monthly salaries — April',          '2026-04-30', 1),
('Salaries',          350000.00, 'Monthly salaries — May',            '2026-05-31', 1),
('Salaries',          350000.00, 'Monthly salaries — June',           '2026-06-30', 1),
('Office Supplies',    12500.00, 'Printer cartridges and stationery', '2026-01-15', 1),
('Office Supplies',     8900.00, 'Cleaning supplies',                 '2026-03-10', 1),
('Office Supplies',    15200.00, 'Ergonomic accessories',             '2026-05-20', 1),
('Software Licenses',  54999.00, 'Adobe Creative Cloud — annual',     '2026-01-05', 1),
('Software Licenses',   8999.00, 'Microsoft 365 — quarterly',         '2026-02-01', 1),
('Software Licenses',  35000.00, 'AWS hosting — Q1',                  '2026-03-01', 1),
('Software Licenses',  35000.00, 'AWS hosting — Q2',                  '2026-06-01', 1),
('Marketing',          45000.00, 'Google Ads — January campaign',     '2026-01-20', 1),
('Marketing',          32000.00, 'Social media marketing — March',    '2026-03-15', 1),
('Marketing',          28000.00, 'Email campaign tool subscription',  '2026-04-10', 1),
('Marketing',          55000.00, 'Trade show booth — May expo',       '2026-05-05', 1),
('Utilities',           4500.00, 'Electricity — January',             '2026-01-25', 1),
('Utilities',           4800.00, 'Electricity — March',               '2026-03-25', 1),
('Utilities',           1500.00, 'Internet — monthly',                '2026-02-15', 1);
