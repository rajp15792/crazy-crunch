-- ==============================================================================
-- CRAZY CRUNCH PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- Food Products: Khari, Toast, Cookies, Farsan
-- Dual Selling Units: Kilogram (kg) & Packet
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Categories
INSERT INTO categories (name, display_order) VALUES
('Khari', 1),
('Toast', 2),
('Cookies', 3),
('Farsan', 4),
('Other Products', 5)
ON CONFLICT (name) DO NOTHING;

-- 2. PRODUCTS TABLE (Dual Selling Units: Kg and Packet)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL REFERENCES categories(name) ON UPDATE CASCADE,
    description TEXT,
    image TEXT NOT NULL,
    gallery TEXT[] DEFAULT ARRAY[]::TEXT[],
    price_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock_kg NUMERIC(10, 2) NOT NULL DEFAULT 0,
    price_packet NUMERIC(10, 2) NOT NULL DEFAULT 0,
    packet_weight VARCHAR(50) DEFAULT '250 g',
    stock_packet INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE,
    is_demo_product BOOLEAN DEFAULT FALSE,
    is_demo_price BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY,
    order_ref VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_area VARCHAR(100) DEFAULT 'Kolhapur',
    customer_city VARCHAR(100) DEFAULT 'Kolhapur',
    customer_pincode VARCHAR(10) DEFAULT '416001',
    customer_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_charge NUMERIC(10, 2) DEFAULT 0,
    grand_total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash on Delivery',
    payment_status VARCHAR(50) DEFAULT 'Pending (Cash on Delivery)',
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Confirmed, Delivered, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'kg' or 'packet'
    weight VARCHAR(50),
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    line_total NUMERIC(10, 2) NOT NULL
);

-- 5. INVENTORY LOGS (Audit trail for adjustments and orders)
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    delta NUMERIC(10, 2) NOT NULL,
    previous_stock NUMERIC(10, 2) NOT NULL,
    new_stock NUMERIC(10, 2) NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- ORDER_DEDUCT, RESTORE_ON_CANCEL, MANUAL_ADJUST
    order_ref VARCHAR(50),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. STORE SETTINGS & OWNER SESSIONS
CREATE TABLE IF NOT EXISTS store_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS owner_sessions (
    token VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Public can read published products only
CREATE POLICY "Public products view" ON products
    FOR SELECT USING (is_published = TRUE);

-- Authenticated owner has full access
-- Service role bypasses RLS for server-side operations
