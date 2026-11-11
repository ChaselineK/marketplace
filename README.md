# WILRICH STORE — CODM Marketplace

A secure, responsive, full-stack marketplace focused on Call of Duty: Mobile (CODM) accounts and in-game currency (CP), built with **Laravel REST API** and **React SPA**.

## Project Architecture & Tech Stack

- **Backend:** Laravel 13 REST API with Laravel Sanctum (cookie-based SPA session authentication & CSRF protection).
- **Frontend:** React 19 (Vite), Tailwind CSS, React Router, Axios, Lucide Icons. Typography strictly uses **Inter**.
- **Database:** SQLite (development / local) / PostgreSQL (production), with full relational constraints, indexed foreign keys, and transactions.
- **Image Storage:** Laravel Filesystem abstraction with strict server-side MIME and dimension validation.
- **WhatsApp Integration:** Server-generated click-to-chat `https://wa.me/` handoff links with immutable snapshots.

## Repository Layout

```text
marketplace/
  backend/          # Laravel REST API
    app/            # Models, Controllers, Policies, Requests, Services
    bootstrap/      # Application bootstrap, routing & middleware
    config/         # Sanctum, CORS, Database & Session configuration
    database/       # Migrations, seeders, factories
    routes/         # api.php (/api/v1), web.php, console.php
    tests/          # Feature and Unit tests
  frontend/         # React SPA (Vite)
    src/
      api/          # Axios API clients & Sanctum CSRF handler
      app/          # Router & Providers
      components/   # Reusable UI & Layout components
      features/     # Auth, Marketplace, Accounts, CP, Orders, Tickets, Vendor, Admin
  docs/             # Technical specifications & implementation plans
  README.md         # Project documentation & instructions
```

## Getting Started

### 1. Backend Setup

```bash
cd backend

# Ensure .env is configured (copied from .env.example)
# When using Laravel Herd, the site is served automatically or via:
php artisan serve --port=8000

# Run migrations
php artisan migrate

# Run automated tests
php artisan test
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

## Security & Architecture Highlights

1. **Stateful SPA Authentication:** Sanctum cookie-based session auth with HttpOnly cookies. No JWTs or plain credentials stored in localStorage.
2. **Server-Side Authorization:** Role middleware (`super_admin`, `vendor`, `customer`) and Eloquent Policies protect every write and sensitive read.
3. **Price & Inventory Integrity:** Database transactions and immutable snapshots for orders. Converted currencies are clearly labeled estimates and do not overwrite authoritative base prices.
4. **Ticket Privacy:** Private storage for evidence attachments; cross-vendor isolation strictly enforced.

