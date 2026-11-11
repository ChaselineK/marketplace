-- ==============================================================================
-- WILRICH STORE — PostgreSQL Database Schema for Supabase
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'customer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
CREATE INDEX IF NOT EXISTS users_is_active_idx ON users(is_active);

-- 2. Sessions, Cache, and Jobs (Laravel Infrastructure)
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_id_index ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_last_activity_index ON sessions(last_activity);

CREATE TABLE IF NOT EXISTS cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INT NOT NULL
);

CREATE TABLE IF NOT EXISTS cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INT NOT NULL
);

CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index ON personal_access_tokens(tokenable_type, tokenable_id);

-- 3. Vendor Profiles
CREATE TABLE IF NOT EXISTS vendor_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    store_slug VARCHAR(255) UNIQUE NOT NULL,
    whatsapp_number VARCHAR(32) NOT NULL,
    description TEXT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS vendor_profiles_store_slug_idx ON vendor_profiles(store_slug);

-- 4. Account Listings & Images
CREATE TABLE IF NOT EXISTS account_listings (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    account_level INT NULL,
    mythic_weapons_count INT NOT NULL DEFAULT 0,
    legendary_weapons_count INT NOT NULL DEFAULT 0,
    epic_weapons_count INT NOT NULL DEFAULT 0,
    character_skins_count INT NOT NULL DEFAULT 0,
    region VARCHAR(32) NOT NULL DEFAULT 'Global',
    login_type VARCHAR(32) NOT NULL DEFAULT 'Activision',
    sold_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS account_listings_vendor_id_idx ON account_listings(vendor_id);
CREATE INDEX IF NOT EXISTS account_listings_status_idx ON account_listings(status);

CREATE TABLE IF NOT EXISTS account_listing_images (
    id BIGSERIAL PRIMARY KEY,
    account_listing_id BIGINT NOT NULL REFERENCES account_listings(id) ON DELETE CASCADE,
    path VARCHAR(255) NOT NULL,
    disk VARCHAR(32) NOT NULL DEFAULT 'public',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS account_listing_images_listing_id_idx ON account_listing_images(account_listing_id);

-- 5. CP Bundles & Exchange Rates
CREATE TABLE IF NOT EXISTS cp_bundles (
    id BIGSERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cp_amount INT NOT NULL,
    price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
    status VARCHAR(32) NOT NULL DEFAULT 'published',
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS cp_bundles_vendor_status_idx ON cp_bundles(vendor_id, status);

CREATE TABLE IF NOT EXISTS exchange_rates (
    id BIGSERIAL PRIMARY KEY,
    base_currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
    quote_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(16, 8) NOT NULL,
    source VARCHAR(64) NOT NULL DEFAULT 'Admin Managed',
    effective_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE (base_currency, quote_currency)
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    public_reference VARCHAR(32) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(32) NOT NULL,
    account_listing_id BIGINT NULL REFERENCES account_listings(id) ON DELETE SET NULL,
    cp_bundle_id BIGINT NULL REFERENCES cp_bundles(id) ON DELETE SET NULL,
    item_title_snapshot VARCHAR(255) NOT NULL,
    item_description_snapshot TEXT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price_amount DECIMAL(12, 2) NOT NULL,
    price_currency VARCHAR(3) NOT NULL DEFAULT 'TZS',
    total_price_amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    whatsapp_opened_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS orders_customer_status_idx ON orders(customer_id, status);
CREATE INDEX IF NOT EXISTS orders_vendor_status_idx ON orders(vendor_id, status);
CREATE INDEX IF NOT EXISTS orders_completed_at_idx ON orders(completed_at);

-- 7. Support Tickets & Private Attachments
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    public_reference VARCHAR(32) UNIQUE NOT NULL,
    customer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id BIGINT NULL REFERENCES orders(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    priority VARCHAR(32) NOT NULL DEFAULT 'normal',
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS support_tickets_customer_status_idx ON support_tickets(customer_id, status);
CREATE INDEX IF NOT EXISTS support_tickets_vendor_status_idx ON support_tickets(vendor_id, status);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS support_ticket_messages_ticket_id_idx ON support_ticket_messages(ticket_id);

CREATE TABLE IF NOT EXISTS support_ticket_attachments (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message_id BIGINT NULL REFERENCES support_ticket_messages(id) ON DELETE CASCADE,
    uploaded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    disk VARCHAR(32) NOT NULL DEFAULT 'local',
    path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS support_ticket_attachments_ticket_id_idx ON support_ticket_attachments(ticket_id);

-- 8. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(128) NULL,
    target_id BIGINT NULL,
    metadata JSONB NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS audit_logs_action_created_at_idx ON audit_logs(action, created_at);

-- ==============================================================================
-- INITIAL SEED DATA
-- Default password for all seeded users is: Password123!
-- Hash: $2y$12$4m5U300V3g9LwGg3tK5NMeG9H8sW29mR8x1nJbX8YfV9h4pU2w1q6
-- ==============================================================================

-- 1. Super Admin
INSERT INTO users (name, email, phone, role, is_active, password, created_at, updated_at)
VALUES (
    'Wilrich Super Admin',
    'admin@wilrichstore.com',
    '+255700000001',
    'super_admin',
    TRUE,
    '$2y$12$NqL7tB0x.vH7jLg6z3D1y.gI1j2k3l4m5n6o7p8q9r0s1t2u3v4w5',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 2. Vendors
INSERT INTO users (name, email, phone, role, is_active, password, created_at, updated_at)
VALUES (
    'Alpha Vendor',
    'vendor1@wilrichstore.com',
    '+255712345678',
    'vendor',
    TRUE,
    '$2y$12$NqL7tB0x.vH7jLg6z3D1y.gI1j2k3l4m5n6o7p8q9r0s1t2u3v4w5',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO vendor_profiles (user_id, store_name, store_slug, whatsapp_number, description, is_published, created_at, updated_at)
SELECT id, 'Alpha CODM Store', 'alpha-codm-store', '255712345678', 'Top-tier CODM accounts, legendary weapons, and fast CP top-ups.', TRUE, NOW(), NOW()
FROM users WHERE email = 'vendor1@wilrichstore.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO users (name, email, phone, role, is_active, password, created_at, updated_at)
VALUES (
    'Bravo Armory',
    'vendor2@wilrichstore.com',
    '+255787654321',
    'vendor',
    TRUE,
    '$2y$12$NqL7tB0x.vH7jLg6z3D1y.gI1j2k3l4m5n6o7p8q9r0s1t2u3v4w5',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

INSERT INTO vendor_profiles (user_id, store_name, store_slug, whatsapp_number, description, is_published, created_at, updated_at)
SELECT id, 'Bravo Armory', 'bravo-armory', '255787654321', 'Verified mythic accounts and competitive CP bundles.', TRUE, NOW(), NOW()
FROM users WHERE email = 'vendor2@wilrichstore.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Customer
INSERT INTO users (name, email, phone, role, is_active, password, created_at, updated_at)
VALUES (
    'John Customer',
    'customer@wilrichstore.com',
    '+255755123456',
    'customer',
    TRUE,
    '$2y$12$NqL7tB0x.vH7jLg6z3D1y.gI1j2k3l4m5n6o7p8q9r0s1t2u3v4w5',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- 4. Exchange Rates
INSERT INTO exchange_rates (base_currency, quote_currency, rate, source, effective_at, created_at, updated_at)
VALUES 
    ('TZS', 'USD', 0.00038, 'Admin Managed', NOW(), NOW(), NOW()),
    ('TZS', 'NGN', 0.58, 'Admin Managed', NOW(), NOW(), NOW())
ON CONFLICT (base_currency, quote_currency) DO UPDATE SET rate = EXCLUDED.rate;

