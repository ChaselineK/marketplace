# WILRICH STORE — CODM Marketplace

A secure, responsive, full-stack peer-to-peer marketplace specialized for Call of Duty: Mobile (CODM) accounts and in-game currency (CP), built with **Laravel REST API** and **React SPA**.

---

## Project Architecture & Tech Stack

- **Backend:** Laravel 13 REST API with Laravel Sanctum (cookie-based SPA session authentication & CSRF protection).
- **Frontend:** React 19 (Vite), Tailwind CSS, React Router, Axios, Lucide Icons. Typography strictly uses **Inter**.
- **Database:** PostgreSQL (Supabase) / SQLite (development/testing), with full relational constraints, indexed foreign keys, and transactions.
- **Image Storage:** Public disk for account listings; private disk for dispute evidence with authorized streaming.
- **WhatsApp Integration:** Server-derived click-to-chat `https://wa.me/` handoff links with immutable snapshots.
- **Timezone Reporting:** Daily completed sales calculated in `Africa/Dar_es_Salaam` (UTC+3) business timezone.

---

## Monorepo Layout

```text
marketplace/
  backend/               # Laravel REST API
    app/
      Actions/Orders/    # Transactional order creation & idempotent state transitions
      Enums/             # UserRole, ListingStatus, OrderStatus, TicketStatus, TicketPriority
      Http/Controllers/  # Customer, Vendor, Admin, Public, and Attachment streaming
      Http/Middleware/   # EnsureUserHasRole, SecurityHeaders
      Http/Requests/     # Form requests with strict validation & file limits
      Http/Resources/    # JSON API resources with sanitized outputs
      Models/            # User, VendorProfile, AccountListing, CpBundle, Order, SupportTicket, etc.
      Policies/          # Cross-vendor isolation policies
      Services/          # DailyReportingService, AuditLogService
    database/
      migrations/        # 6 migration batches
      seeders/           # Realistic demo users, listings, CP bundles, orders, and tickets
    routes/              # api.php (/api/v1), web.php, console.php
    tests/               # 54 Automated Feature tests across all 9 phases
  frontend/              # React 19 SPA (Vite)
    src/
      api/               # Axios client with CSRF token management
      components/        # Navbar, PriceDisplay, RoleRoute
      context/           # AuthContext, CurrencyContext (TZS, USD, NGN live estimates)
      pages/             # Customer, Vendor, Admin, and Compliance pages
  docs/                  # 5 System requirement specifications
  supabase_schema.sql    # Complete PostgreSQL schema & seed script for Supabase
  README.md              # Project documentation & instructions
```

---

## Demo Accounts

All seeded accounts use password: `Password123!`

| Role | Email | Capabilities |
| :--- | :--- | :--- |
| **Super Admin** | `admin@wilrichstore.com` | Full governance, vendor provisioning & suspension, exchange rates (`TZS`, `USD`, `NGN`), platform dispute mediation, audit trail. |
| **Vendor 1** | `vendor1@wilrichstore.com` | *Alpha CODM Store*: Daily sales (`Africa/Dar_es_Salaam`), account inventory, CP bundles, orders queue, ticket replies. |
| **Vendor 2** | `vendor2@wilrichstore.com` | *Bravo Armory*: Independent inventory, orders queue, and cross-vendor isolation. |
| **Customer** | `customer@wilrichstore.com` | Browse accounts & CP, place orders, WhatsApp handoff, track order status, submit support tickets with private evidence. |

---

## Connecting Supabase (PostgreSQL)

You can run WILRICH STORE against Supabase using either of two methods:

### Option A: Direct SQL in Supabase Dashboard (Instant — 30 Seconds)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor** → **New query**.
3. Copy the entire contents of [`supabase_schema.sql`](./supabase_schema.sql) and click **Run**.
4. All tables (`users`, `vendor_profiles`, `account_listings`, `cp_bundles`, `orders`, `support_tickets`, `exchange_rates`, `audit_logs`) will immediately appear in **Table Editor**.

### Option B: Laravel Database Connection
1. In `backend/.env`, configure your PostgreSQL credentials:
```env
DB_CONNECTION=pgsql
DB_HOST=db.nwradnlsmavowybdfmpq.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=YOUR_SUPABASE_DB_PASSWORD
```
*(If your network requires connection pooling, use host `aws-0-[region].pooler.supabase.com` on port `5432` with username `postgres.nwradnlsmavowybdfmpq`)*

2. Run migrations:
```bash
cd backend
php artisan migrate --seed
```

---

## Automated Test Suite

Run the full test suite verifying all 9 implementation phases:

```bash
cd backend
php artisan test
```

```
Tests:    54 passed (192 assertions)
Duration: 3.2s
Status:   100% Passing across all Phase test suites
```

- `PhaseZeroTest.php`: Base scaffolding, versioning `/api/v1`, CORS, Sanctum.
- `PhaseOneAuthTest.php`: Public registration (`customer` only), role middleware, vendor status toggling.
- `PhaseTwoVendorStorefrontTest.php`: Vendor directory, public storefronts, cross-vendor isolation.
- `PhaseThreeAccountListingTest.php`: Account inventory, safe images (JPEG/PNG/WebP, 5MB), stock visibility.
- `PhaseFourCpAndCurrencyTest.php`: CP bundles, exchange rate updates, multi-currency display estimates.
- `PhaseFiveOrderTest.php`: Transactional order creation, row locks, WhatsApp links, auto-marking sold.
- `PhaseSixSupportTicketTest.php`: Support tickets, private image storage, policy protection, unpermitted files blocked.
- `PhaseSevenDashboardAndReportingTest.php`: Timezone `Africa/Dar_es_Salaam` sales aggregation, lifetime revenue, vendor sales breakdown, audit logs.
- `PhaseEightHardeningTest.php`: Security headers, rate limiting (auth & orders), no leaked credentials.

---

## Local Development Servers

- **Frontend App:** `http://localhost:5173`
- **Backend API:** `http://localhost:8000/api/v1`
