# CODM Marketplace --- Database & API Specification

## 1. General data rules

-   Use primary keys (UUIDs or ULIDs are recommended for public-facing
    identifiers; integer IDs are also acceptable internally).
-   Use foreign keys and indexes for relationships and common filters.
-   Store timestamps in UTC; display them in `Africa/Dar_es_Salaam`.
-   Use decimal or integer minor units for money; never use
    floating-point columns for prices.
-   Store currency as an ISO-style code: `TZS`, `USD`, `NGN`.
-   Keep order snapshots so later listing edits do not rewrite
    historical orders.
-   Use soft deletes where historical references must remain available.
-   Add `created_at` and `updated_at` consistently.

## 2. Suggested tables

### users

  Column              Notes
  ------------------- -------------------------------------
  id                  Primary key
  name                Required
  email               Unique, required
  phone               Optional; normalized format
  password            Laravel hashed password
  role                `super_admin`, `vendor`, `customer`
  is_active           Boolean
  email_verified_at   Nullable
  remember_token      Laravel standard
  timestamps          Standard

Only the Super Admin creates vendor users in the initial release. Public
registration always creates a `customer`; never accept a role from the
registration payload.

### vendor_profiles

  Column            Notes
  ----------------- ----------------------------------
  id                Primary key
  user_id           Unique FK to users
  store_slug        Unique
  store_name        Required
  whatsapp_number   International number, normalized
  description       Nullable
  is_published      Boolean
  timestamps        Standard

### account_listings

  Column           Notes
  ---------------- -----------------------------------------------
  id               Primary key
  vendor_id        FK to users (role vendor)
  title            Required
  description      Required
  price_amount     Decimal/integer minor units
  price_currency   TZS/USD/NGN
  status           draft, published, sold, unavailable, archived
  sold_at          Nullable
  timestamps       Standard
  deleted_at       Nullable if soft deletes are used

### account_listing_images

  Column               Notes
  -------------------- ------------------------
  id                   Primary key
  account_listing_id   FK
  disk                 Storage disk
  path                 Generated storage path
  alt_text             Optional
  sort_order           Integer
  timestamps           Standard

Use multiple images only if the product design calls for it; otherwise
limit the interface to one or a small fixed maximum.

### cp_bundles

  Column           Notes
  ---------------- -------------------------------
  id               Primary key
  vendor_id        FK to users
  cp_amount        Positive integer, e.g. 2400
  price_amount     Decimal/integer minor units
  price_currency   TZS/USD/NGN
  status           draft, published, unavailable
  timestamps       Standard
  deleted_at       Nullable

A shared CP image can be configured as a category asset. Do not
duplicate the same image file for every bundle unless there is a
specific reason.

### orders

  Column                      Notes
  --------------------------- -----------------------------------------------------
  id                          Primary key
  public_reference            Unique, unguessable reference
  customer_id                 FK to users
  vendor_id                   FK to users
  item_type                   `account` or `cp_bundle`
  account_listing_id          Nullable FK
  cp_bundle_id                Nullable FK
  item_title_snapshot         Required
  item_description_snapshot   Optional
  quantity                    Default 1; enforce rules per product type
  unit_price_amount           Snapshot
  price_currency              Snapshot
  total_price_amount          Snapshot
  status                      pending, processing, completed, cancelled, disputed
  whatsapp_opened_at          Nullable; only if tracked
  completed_at                Nullable
  cancelled_at                Nullable
  timestamps                  Standard

Add a database constraint or application-level invariant ensuring
exactly one of `account_listing_id` or `cp_bundle_id` is set and matches
`item_type`. If accounts are single-quantity products, quantity must be
exactly one.

### support_tickets

  Column             Notes
  ------------------ -----------------------------------------------------------
  id                 Primary key
  public_reference   Unique
  customer_id        FK to users
  vendor_id          FK to users --- selected vendor
  subject            Optional or required by UX decision
  description        Required
  status             open, in_progress, waiting_for_customer, resolved, closed
  priority           Optional
  timestamps         Standard

### support_ticket_attachments

  Column        Notes
  ------------- ----------------------
  id            Primary key
  ticket_id     FK
  uploaded_by   FK to users
  disk          Private storage disk
  path          Generated path
  mime_type     Verified MIME
  size_bytes    Verified size
  timestamps    Standard

Evidence images should be stored privately and served through an
authorized download endpoint, not a public predictable URL.

### support_ticket_messages (recommended)

Use this table if customer/vendor/Super Admin conversations are
required: - `id`, `ticket_id`, `sender_id`, `message`, timestamps. -
Authorize every message read/write using the ticket policy. - Other
vendors must not access messages or attachments.

### exchange_rates

  Column           Notes
  ---------------- ------------------
  id               Primary key
  base_currency    e.g. TZS
  quote_currency   e.g. USD
  rate             Positive decimal
  source           Provider/admin
  effective_at     Timestamp
  timestamps       Standard

### audit_logs (recommended)

Record actor, action, target type/ID, safe metadata, IP/user agent where
appropriate, and timestamp. Never record passwords, authentication
tokens, or sensitive account credentials.

## 3. Relationships

-   User has one vendor profile when role is `vendor`.
-   Vendor user has many account listings.
-   Account listing has many images.
-   Vendor user has many CP bundles.
-   Customer user has many orders.
-   Vendor user has many orders.
-   Order belongs to customer and vendor; order optionally belongs to
    one account listing or one CP bundle.
-   Customer has many support tickets.
-   Vendor has many assigned support tickets.
-   Ticket has many attachments and, if enabled, messages.

## 4. API conventions

Base prefix: `/api/v1`.

Return JSON consistently. Suggested success shape:

``` json
{
  "data": {},
  "meta": {}
}
```

Suggested validation/error shape:

``` json
{
  "message": "The given data was invalid.",
  "errors": {
    "field": ["A clear validation message."]
  }
}
```

Use standard HTTP status codes: 200, 201, 204, 401, 403, 404, 409, 422,
429 and 500 as appropriate. Do not expose stack traces or internal
exception details in production.

## 5. Authentication endpoints

  Method   Endpoint                    Access
  -------- --------------------------- ------------------------------
  GET      `/sanctum/csrf-cookie`      Guest
  POST     `/api/v1/register`          Guest; creates customer only
  POST     `/api/v1/login`             Guest
  POST     `/api/v1/logout`            Authenticated
  GET      `/api/v1/me`                Authenticated
  POST     `/api/v1/forgot-password`   Guest
  POST     `/api/v1/reset-password`    Guest

For cookie-based SPA authentication, ensure Sanctum's documented setup
is followed. The CSRF cookie endpoint is typically under `/sanctum`, not
the versioned API prefix.

## 6. Marketplace endpoints

  Method   Endpoint                       Access
  -------- ------------------------------ ------------------------
  GET      `/api/v1/vendors`              Authenticated customer
  GET      `/api/v1/vendors/{slug}`       Authenticated customer
  GET      `/api/v1/listings`             Authenticated customer
  GET      `/api/v1/listings/{listing}`   Authenticated customer
  GET      `/api/v1/cp-bundles`           Authenticated customer
  GET      `/api/v1/currency-rates`       Authenticated customer

Support query parameters such as `q`, `vendor`, `status`, `sort`,
`currency`, `page`, and `per_page`. Public/customer queries must only
return published, available inventory.

## 7. Customer endpoints

  ----------------------------------------------------------------------------------------
  Method                  Endpoint                                 Access
  ----------------------- ---------------------------------------- -----------------------
  POST                    `/api/v1/orders`                         Customer

  GET                     `/api/v1/orders`                         Customer; own orders
                                                                   only

  GET                     `/api/v1/orders/{order}`                 Customer; own order
                                                                   only

  POST                    `/api/v1/tickets`                        Customer

  GET                     `/api/v1/tickets`                        Customer; own tickets
                                                                   only

  GET                     `/api/v1/tickets/{ticket}`               Customer; own ticket
                                                                   only

  POST                    `/api/v1/tickets/{ticket}/attachments`   Customer; own ticket
                                                                   only

  POST                    `/api/v1/tickets/{ticket}/messages`      Customer; own ticket
                                                                   only, if messages
                                                                   enabled
  ----------------------------------------------------------------------------------------

The order creation endpoint accepts a product identifier and permitted
quantity. It must not trust client-supplied vendor ID, product title,
price, currency, total or order status. Resolve these values from the
database.

## 8. Vendor endpoints

Protect with authentication, vendor-role middleware and policies.

  -------------------------------------------------------------------------------------------------------
  Method                  Endpoint                                                Access
  ----------------------- ------------------------------------------------------- -----------------------
  GET                     `/api/v1/vendor/dashboard`                              Vendor

  GET/POST                `/api/v1/vendor/account-listings`                       Vendor

  GET/PATCH/DELETE        `/api/v1/vendor/account-listings/{listing}`             Owner vendor

  POST                    `/api/v1/vendor/account-listings/{listing}/mark-sold`   Owner vendor

  GET/POST                `/api/v1/vendor/cp-bundles`                             Vendor

  GET/PATCH/DELETE        `/api/v1/vendor/cp-bundles/{bundle}`                    Owner vendor

  GET                     `/api/v1/vendor/orders`                                 Vendor; own orders

  GET                     `/api/v1/vendor/orders/{order}`                         Assigned vendor

  PATCH                   `/api/v1/vendor/orders/{order}/status`                  Assigned vendor

  GET                     `/api/v1/vendor/tickets`                                Assigned vendor

  GET                     `/api/v1/vendor/tickets/{ticket}`                       Assigned vendor

  PATCH                   `/api/v1/vendor/tickets/{ticket}`                       Assigned vendor

  POST                    `/api/v1/vendor/tickets/{ticket}/messages`              Assigned vendor, if
                                                                                  enabled
  -------------------------------------------------------------------------------------------------------

Vendor listing endpoints must derive `vendor_id` from the authenticated
user, never from a trusted client parameter.

## 9. Super Admin endpoints

Protect with authentication and Super Admin middleware/policies.

  Method      Endpoint                           Access
  ----------- ---------------------------------- -------------
  GET         `/api/v1/admin/dashboard`          Super Admin
  GET/POST    `/api/v1/admin/vendors`            Super Admin
  GET/PATCH   `/api/v1/admin/vendors/{vendor}`   Super Admin
  GET         `/api/v1/admin/customers`          Super Admin
  GET         `/api/v1/admin/listings`           Super Admin
  GET         `/api/v1/admin/orders`             Super Admin
  GET         `/api/v1/admin/tickets`            Super Admin
  GET/PATCH   `/api/v1/admin/tickets/{ticket}`   Super Admin
  GET/PATCH   `/api/v1/admin/exchange-rates`     Super Admin
  GET         `/api/v1/admin/audit-logs`         Super Admin

Use dedicated admin actions for sensitive operations, and record them in
audit logs.

## 10. Order lifecycle and stock safety

Recommended initial lifecycle:

`pending → processing → completed`

Alternative exits: `pending → cancelled`; `processing → cancelled` only
with permitted rules. A disputed state may be introduced for customer
support.

Order creation must: 1. Begin a database transaction. 2. Load the
selected listing/bundle with a lock where necessary. 3. Confirm it is
published and available. 4. For a unique CODM account, ensure it is not
already reserved/sold and prevent a second active order. 5. Create the
order with immutable item/price snapshots. 6. Reserve or otherwise lock
the unique account according to a clearly defined reservation policy. 7.
Commit. 8. Return the order and server-generated WhatsApp handoff
details.

Define a reservation expiry policy before implementation. If no expiry
is implemented, an account should remain reserved while its order is
pending/processing until a vendor cancels/completes it. Do not allow two
customers to buy the same unique account concurrently.

When a vendor marks an order completed: - Verify vendor ownership and
valid current status. - Set `completed_at` once. - For account orders,
mark the account sold and unavailable in the same transaction. - Ensure
retries do not count the same sale twice.

## 11. Ticket privacy

Ticket access must be enforced in a Policy and query scope: - Super
Admin: all tickets. - Customer: tickets where `customer_id` equals
authenticated user. - Vendor: tickets where `vendor_id` equals
authenticated user. - No other vendor access, including attachments,
messages, exports, search results or guessed IDs.

Use private attachment storage and authorize each file download. Test
cross-vendor access explicitly.
