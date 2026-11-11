# CODM Marketplace --- Implementation Plan, Agent Instructions & Acceptance Tests

## 1. Instructions to the coding agent

Build this project incrementally. Read all five project documents before
coding. Treat this document as the execution checklist and the other
documents as the requirements and design reference.

Core principles: 1. Laravel is the source of truth. 2. React is a
separate frontend consuming a versioned Laravel API. 3. Authorization is
enforced on the server with middleware and policies. 4. Use clean,
readable, maintainable code; avoid unnecessary complexity. 5. Validate
both client-side and server-side. 6. Never trust prices, roles, vendor
IDs, order status, ownership or stock state sent by the browser. 7. Add
automated tests as each feature is implemented. 8. Do not silently
invent product or business rules. If a decision is missing, choose the
safest simple default and document it. 9. Do not build payment
processing or claim WhatsApp messages are sent automatically in the
initial release. 10. Keep the application extensible for later features.

## 2. Suggested repository layout

A monorepo is convenient:

``` text
codm-marketplace/
  backend/       # Laravel API
  frontend/      # React SPA
  docs/          # These five Markdown documents
  README.md
```

Keep frontend and backend environment variables separate. Commit
`.env.example` files only; never commit real secrets, credentials,
production database files or customer evidence.

## 3. Development phases

### Phase 0 --- Project foundation

-   Create Laravel backend and React frontend.
-   Configure database and migrations.
-   Configure CORS, Sanctum stateful domains, sessions and CSRF.
-   Configure API version prefix `/api/v1`.
-   Configure formatting, linting and test commands.
-   Create a README with setup instructions.
-   Establish shared response/error conventions.

**Exit condition:** frontend can call a protected test endpoint after
successful cookie-based authentication, and unauthenticated requests
receive the expected 401 response.

### Phase 1 --- Authentication and role authorization

-   Implement customer registration, login, logout, `/me` and password
    reset.
-   Ensure public registration always creates a customer.
-   Implement role enum/constants and role middleware.
-   Implement Super Admin vendor creation.
-   Create React login/register pages and role-aware route guards.
-   Implement secure remember-me behavior through Laravel session
    facilities.
-   Add rate limits and CSRF protection.

**Exit condition:** all three roles can sign in and are routed to their
correct portals; attempts to access another role's backend endpoints
return 403.

### Phase 2 --- Vendor profiles and storefronts

-   Implement vendor profile model and migrations.
-   Implement vendor profile management.
-   Add vendor directory and vendor storefront API.
-   Build customer-facing vendor pages.
-   Build vendor portal shell.

**Exit condition:** each vendor has a distinct storefront and cannot
edit another vendor's profile.

### Phase 3 --- CODM account inventory

-   Implement account listing and image models.
-   Build create/edit/list/detail operations.
-   Validate image MIME, extension, dimensions and size server-side.
-   Use safe generated filenames and storage.
-   Implement publish/unpublish/sold states.
-   Build React inventory forms and marketplace pages.

**Exit condition:** a vendor can manage their own accounts; a
sold/unpublished account disappears from customer availability and
cannot be ordered.

### Phase 4 --- CP bundles and currency display

-   Implement CP bundle model and API.
-   Use the shared CP image.
-   Build vendor CP management and customer CP marketplace.
-   Implement exchange-rate storage/provider or admin-managed rates.
-   Add TZS/USD/NGN display conversion with rate timestamp.
-   Keep original price as the authoritative amount.

**Exit condition:** vendor-specific CP bundle prices are displayed
correctly and conversions are labeled estimates.

### Phase 5 --- Orders and WhatsApp handoff

-   Implement transactional order creation.
-   Re-check product availability and ownership on the server.
-   Prevent duplicate active orders for unique account inventory.
-   Generate unique public order references.
-   Save immutable item and price snapshots.
-   Build customer order history/detail.
-   Build vendor order queue and order detail.
-   Generate a server-derived WhatsApp click-to-chat URL.
-   Implement valid order status transitions and completion.

**Exit condition:** a customer can create an order, see it in history,
continue to the correct vendor on WhatsApp, and the correct vendor can
complete it. Repeated completion does not double-count sales.

### Phase 6 --- Support tickets and evidence

-   Implement ticket creation, assignment to selected vendor and status.
-   Implement private evidence image storage.
-   Implement policy-protected ticket and attachment access.
-   Build customer and vendor ticket pages.
-   Build Super Admin ticket management.

**Exit condition:** customer, selected vendor and Super Admin can access
a ticket; unrelated vendors cannot access the ticket, its messages,
attachments, API response or download URL.

### Phase 7 --- Dashboards, reporting and audit

-   Implement vendor dashboard aggregates.
-   Implement Super Admin aggregates.
-   Add date/vendor filters.
-   Add audit logs for important changes.
-   Build responsive dashboard UI.

**Daily sales rule:** calculate today's completed sales using
`completed_at` in the `Africa/Dar_es_Salaam` business timezone. Store
timestamps in UTC and query the local-day start/end converted to UTC. Do
not reset or delete sales every 24 hours. Historical sales must remain
available. Count an order once when it transitions to completed.

### Phase 8 --- Hardening and release

-   Complete automated feature and policy tests.
-   Add rate limiting and security headers.
-   Review file storage permissions.
-   Configure backups and restore procedure.
-   Configure production logging and monitoring.
-   Test deployment and environment configuration.
-   Review accessibility and responsive behavior.
-   Review legal/publisher compliance and publish clear terms, privacy,
    refund and dispute policies.

## 4. Important implementation rules

### Authentication and CSRF

`@csrf` is a Blade directive, not a React feature. In the React +
Laravel Sanctum SPA architecture, use the CSRF cookie endpoint and
session-based CSRF middleware protection. Do not disable CSRF to make
API requests work. Configure CORS and credentials correctly.

### Client-side and server-side validation

React validation improves usability. Laravel Form Requests are
authoritative. Repeat every meaningful validation on the backend,
including: - Required fields and length limits. - Email and phone
formats. - Positive prices and CP amounts. - Supported currency codes. -
Image type, content, size and dimensions. - Listing ownership. - Order
availability and quantity. - Ticket vendor selection and attachment
limits.

### Inventory and orders

-   A sold account cannot be purchased.
-   A hidden or archived item cannot be ordered.
-   Never trust a price from the browser.
-   Use database transactions and row locks for unique inventory.
-   Define how long a pending account order reserves inventory.
-   A vendor cannot complete another vendor's order.
-   Completion is idempotent and records `completed_at` once.

### WhatsApp

Use a `wa.me` click-to-chat URL for the initial version. The order must
be created first. The user then chooses to open WhatsApp and sends the
prefilled message. Store the vendor's verified contact number in
international format. Do not expose arbitrary client-supplied phone
numbers or message prices.

### Image security

-   Server-side allowlist: JPEG, PNG and WebP (unless a deliberate
    product decision changes it).
-   Validate actual MIME/content, not only file extension.
-   Enforce maximum file size and dimensions.
-   Generate filenames; never use user-supplied paths.
-   Store ticket evidence privately.
-   Do not permit SVG or executable files for these uploads.
-   Authorize every private file read.

### Daily reporting

For a local business date: 1. Determine midnight at
`Africa/Dar_es_Salaam`. 2. Determine the next local midnight. 3. Convert
the range to UTC for database querying. 4. Aggregate orders where
`status = completed` and `completed_at` falls in that range. 5. Group by
vendor for vendor dashboards and include all vendors for Super Admin. 6.
Use a unique order transition/event or transaction-safe state update to
avoid duplicate counting.

## 5. Minimum acceptance test checklist

### Authentication and roles

-   [ ] Guest opening a protected route is redirected to login.
-   [ ] Guest can register as customer.
-   [ ] Registration payload containing `role=super_admin` or
    `role=vendor` is ignored/rejected; account remains customer.
-   [ ] Customer cannot call vendor/admin endpoints.
-   [ ] Vendor cannot call Super Admin endpoints.
-   [ ] Vendor A cannot access Vendor B listing, order or ticket records
    by changing an ID.
-   [ ] Super Admin can access permitted platform-wide resources.
-   [ ] Logout invalidates the session.
-   [ ] CSRF-protected mutations fail when CSRF protection is
    missing/invalid.

### Listings and uploads

-   [ ] Vendor can create an account listing with valid image and
    fields.
-   [ ] Vendor cannot create/edit a listing for another vendor.
-   [ ] Invalid file types, oversized files and deceptive extensions are
    rejected.
-   [ ] Sold/unpublished listings do not appear in customer search.
-   [ ] Sold/unpublished listings cannot be ordered even if a customer
    submits a direct API request.
-   [ ] CP bundles use the correct shared image and vendor-specific
    price.

### Orders

-   [ ] Customer can order an available item.
-   [ ] Order price/vendor/title are resolved from the database, not
    client input.
-   [ ] Customer cannot view another customer's order.
-   [ ] Order history displays the saved order snapshot.
-   [ ] WhatsApp handoff targets the correct vendor and contains the
    correct order reference.
-   [ ] Opening WhatsApp does not mark the order paid or completed.
-   [ ] Two concurrent attempts cannot purchase the same unique account.
-   [ ] Only the assigned vendor or Super Admin can perform permitted
    order administration.
-   [ ] Repeating the completion request does not double-count the sale.
-   [ ] Completing an account order marks its account sold in the same
    transaction.

### Support tickets

-   [ ] Customer can create a ticket and select a vendor.
-   [ ] Ticket evidence accepts only permitted image files.
-   [ ] Ticket evidence is not publicly accessible.
-   [ ] Ticket creator can view their ticket.
-   [ ] Selected vendor can view the ticket.
-   [ ] Super Admin can view the ticket.
-   [ ] Other vendor cannot view ticket details, attachments, messages,
    search results or guessed URLs.

### Currency and reporting

-   [ ] TZS, USD and NGN can be selected for display.
-   [ ] Converted values are marked as estimates.
-   [ ] Missing/stale rates are handled safely.
-   [ ] Existing order price snapshots do not change when exchange rates
    change.
-   [ ] Vendor daily sales include only that vendor's completed orders.
-   [ ] Super Admin daily sales include all vendors.
-   [ ] Local-day boundary uses `Africa/Dar_es_Salaam`.
-   [ ] Sales remain in historical records after a new day begins.

### UX and reliability

-   [ ] Inter is loaded and typography hierarchy is consistent.
-   [ ] Header/footer are responsive and minimal.
-   [ ] Search is debounced and server-backed.
-   [ ] Loading, empty, validation, success and error states exist.
-   [ ] Forms are keyboard accessible and have labels.
-   [ ] No gradient/glow buttons or emoji-based UI.
-   [ ] API pagination is used for large lists.
-   [ ] Production responses do not expose stack traces or secrets.

## 6. Definition of done

A feature is not complete merely because its page looks correct. It is
complete when: - Its API and database behavior work. - Its authorization
rules are tested. - Its validation is enforced server-side. - Its React
UI handles loading, success and failure. - Its relevant acceptance tests
pass. - Its documentation/setup notes are updated.

## 7. Final delivery expectations

Provide: - Complete backend and frontend source. - Database migrations
and seeders for a development Super Admin and sample vendors (never
production default passwords). - `.env.example` files with placeholders
only. - Setup and run instructions. - API documentation. - Automated
test suite and commands to run it. - A short explanation of
architecture, key security decisions and known limitations. - A list of
assumptions and any deferred features.
