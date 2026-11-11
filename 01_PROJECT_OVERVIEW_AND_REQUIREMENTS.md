# CODM Marketplace --- Project Overview & Requirements

## 1. Project purpose

Build a secure, responsive, full-stack marketplace focused on two
product categories:

1.  **Call of Duty: Mobile (CODM) accounts** --- vendor-listed accounts
    with images, descriptions, prices and availability.
2.  **CODM in-game currency (CP)** --- vendor-listed CP bundles with a
    bundle value and vendor-specific price.

Customers register and sign in, browse vendor storefronts, search and
compare listings, create orders, view their order history, and continue
an order with the selected vendor through WhatsApp.

The platform coordinates listings and orders. Unless a compliant payment
provider is added in a later phase, the website does **not** collect or
process customer payments.

## 2. User roles

Use three role types:

  -----------------------------------------------------------------------
  Role                                Responsibilities
  ----------------------------------- -----------------------------------
  Super Admin                         Full platform control; manage
                                      vendors/admins, customers,
                                      listings, orders, support tickets,
                                      platform settings and reporting.

  Vendor Admin                        Manage only their own storefront,
                                      listings, stock, orders assigned to
                                      them, and tickets assigned to them.

  Customer                            Browse listings, create and view
                                      their own orders, contact the
                                      selected vendor through WhatsApp,
                                      and submit/view their own support
                                      tickets.
  -----------------------------------------------------------------------

There will initially be two vendor-admin accounts. Do not hard-code the
number two into authorization logic; allow the Super Admin to add or
disable vendors later.

### Authorization rules

-   A customer must never access admin routes or another customer's
    records.
-   A vendor must never manage another vendor's listings, orders, or
    assigned tickets.
-   The Super Admin can access all platform records.
-   A vendor may only mark an order complete when the order belongs to
    that vendor.
-   A ticket is visible to its creator, the Super Admin, and the vendor
    selected on that ticket. Other vendors must not see it.
-   Enforce these rules on the Laravel server for every protected
    operation. Hiding buttons or pages in React is not security.

## 3. Main customer journeys

### 3.1 Registration and sign-in

1.  Visitor opens the application.
2.  Protected marketplace pages redirect unauthenticated visitors to
    sign-in.
3.  Visitor can navigate to registration from the sign-in page.
4.  After successful registration/sign-in, the customer enters the
    marketplace.
5.  Offer a secure "Remember me" option.

**Important:** Do not store passwords or bearer tokens in browser local
storage. For a first-party React SPA, use Laravel Sanctum's cookie-based
SPA authentication with secure, HttpOnly session cookies, CSRF
protection, and appropriate session settings. The browser may retain a
session/remember-me cookie according to secure server settings; it must
not expose credentials to JavaScript.

### 3.2 Browse and order CODM accounts

-   Customer can view available accounts and open a detail page.
-   Listing shows vendor, images, description, price, and availability.
-   Customer selects a listing and creates an order.
-   Server creates a unique order reference and records the vendor,
    customer, item snapshot, and price snapshot.
-   Customer sees the order in order history and can choose **Continue
    on WhatsApp**.
-   The WhatsApp message is prefilled with the order reference and
    summary and directed to the vendor selected for that listing.

### 3.3 Browse and order CP

-   Use one standard CP product image for the currency category.
-   Each vendor can list multiple bundle values and set a price for each
    bundle.
-   Example: `2,400 CP — TZS 65,000`.
-   Each bundle belongs to one vendor and has its own
    availability/status.
-   Customer creates an order and is directed to the relevant vendor
    using the same WhatsApp handoff process.

### 3.4 Order history

Customers can view only their own orders, including: - Order reference
and date. - Product category and item/bundle details. - Vendor/store. -
Price and currency at the time of order. - Current order status. -
WhatsApp handoff action, where applicable.

### 3.5 Report a problem

Customer submits a ticket by: 1. Selecting the vendor/admin the problem
concerns. 2. Writing a description. 3. Optionally attaching supporting
image evidence. 4. Submitting the ticket.

Ticket visibility is restricted to the customer who created it, the
Super Admin, and the selected vendor. The Super Admin can review and
manage every ticket. The selected vendor can respond/update permitted
ticket fields. Unrelated vendors have no access.

## 4. Vendor journeys

Each vendor has a separate storefront and dashboard.

Vendor capabilities: - Edit permitted storefront details, including
display name and WhatsApp contact number (subject to Super Admin
approval if desired). - Create, edit, publish, unpublish and remove
their own account listings. - Upload account listing images. - Create
and manage CP bundles and their prices. - Mark an account as sold or
unavailable. - View and process only their own orders. - Mark eligible
orders as completed. - View tickets assigned to them.

A sold account must immediately stop appearing as available to customers
and must not be orderable. Preserve its historical order references and
snapshots.

## 5. Super Admin capabilities

-   Dashboard with platform-wide metrics.
-   Create, edit, suspend and reactivate vendor-admin accounts.
-   View and manage all customers, vendors, listings, orders and support
    tickets.
-   View vendor-level and platform-level reporting.
-   Configure platform settings, supported currencies, and
    conversion-rate source/settings.
-   Audit important administrative actions.

## 6. Currency display and conversion

The interface supports: - Tanzanian Shilling (TZS) - US Dollar (USD) -
Nigerian Naira (NGN)

Store each listing's actual sale price in its vendor-selected base
currency, initially defaulting to TZS. Display converted estimates in
the customer's selected display currency.

Requirements: - Keep the original amount and currency as the
authoritative order price. - Never overwrite an order's price when
exchange rates change. - Use rates from a configurable, reputable
exchange-rate source or a controlled admin-managed rate table. - Store
rate, source, and last-updated timestamp. - Clearly label conversions as
estimates. - If no current rate is available, show the original price
rather than inventing a conversion. - Do not treat converted display
values as payment quotes unless the vendor explicitly confirms them.

## 7. Search and navigation

Provide a responsive search field that can search: - Account listings by
title/description and relevant attributes. - CP bundles by CP amount. -
Vendors/storefronts.

Support category filters, vendor filters, availability filters, sorting,
pagination, empty states, and clear search reset. Search results must
only include published and available items.

## 8. Visual and interaction direction

-   Clean, restrained, professional marketplace interface.
-   Use **Inter** as the primary typeface.
-   Establish consistent typography for page titles, section headings,
    labels, body text, helper text and prices.
-   Minimal header and footer; avoid visual clutter.
-   No emojis, glow effects, gradient buttons, or exaggerated
    "vibe-coded" decoration.
-   Use clear contrast, accessible focus states, readable forms,
    consistent spacing and responsive layouts.
-   Use reusable React components rather than duplicating page markup.

## 9. Non-functional requirements

-   Server-side authorization and validation for every write and
    sensitive read.
-   Client-side validation for fast feedback, never as a replacement for
    server validation.
-   CSRF protection for cookie-authenticated state-changing requests.
-   Secure password hashing and rate-limited authentication.
-   Strict image upload validation and storage outside executable/public
    code paths.
-   Database transactions for order creation and stock changes.
-   Audit logs for important administrative actions.
-   Pagination for large collections.
-   Clear API error responses.
-   Automated tests for access control, order lifecycle, stock handling
    and ticket privacy.
-   Responsive support for desktop and mobile browsers.

## 10. Scope boundaries and assumptions

Initial release: - Product listings, order creation, WhatsApp handoff,
order history, vendor dashboards, support tickets, reporting and
currency display conversion. - No built-in card/mobile-money payment
processing unless explicitly added later. - No automatic CODM account
delivery or automated CP fulfilment unless a compliant provider/API is
integrated later. - No customer-to-customer marketplace or vendor
self-registration in the first release; Super Admin creates vendor
accounts.

## 11. Platform and publisher compliance

Before launch, verify the current Activision/CODM terms and the
applicable Apple/Google and regional rules for account transfers and CP
purchases. Do not advertise the platform as official or affiliated
unless written authorization exists. Do not support stolen, compromised,
fraudulently obtained, or otherwise unauthorized accounts/currency.
Avoid collecting customers' CODM passwords, recovery codes, or other
sensitive account credentials. Use authorized fulfilment methods and
clearly disclose vendor responsibility, refund/dispute rules, and the
marketplace's role.
