# CODM Marketplace --- Frontend UX & Page Specification

## 1. Frontend objectives

Build a polished, responsive React application with a clean marketplace
feel. Use Inter, clear typographic hierarchy, restrained colors,
consistent spacing, and reusable components. Do not use emojis, glowing
effects, gradient buttons, or unnecessary animation.

The frontend must reflect backend permissions, but it is not the
security boundary. Laravel remains responsible for access control.

## 2. Route map

Suggested React Router routes:

``` text
/                         -> Redirect to /login when unauthenticated
/login                    -> Sign-in
/register                 -> Customer registration
/forgot-password          -> Password reset request

/app                      -> Customer marketplace home
/app/accounts             -> Browse CODM accounts
/app/accounts/:id         -> Account details
/app/cp                   -> Browse CP bundles
/app/vendors              -> Vendor directory
/app/vendors/:slug        -> Vendor storefront
/app/orders               -> Customer order history
/app/orders/:reference    -> Customer order detail
/app/report-problem       -> Create support ticket
/app/tickets              -> Customer tickets
/app/tickets/:reference   -> Ticket detail

/vendor                   -> Vendor dashboard
/vendor/accounts          -> Vendor account inventory
/vendor/accounts/new      -> Create account listing
/vendor/accounts/:id/edit -> Edit account listing
/vendor/cp                -> Vendor CP bundles
/vendor/cp/new            -> Create CP bundle
/vendor/cp/:id/edit       -> Edit CP bundle
/vendor/orders            -> Vendor orders
/vendor/orders/:id        -> Vendor order detail
/vendor/tickets           -> Assigned support tickets
/vendor/tickets/:id       -> Ticket detail
/vendor/store-settings    -> Store profile and WhatsApp number

/admin                    -> Super Admin dashboard
/admin/vendors            -> Manage vendor admins
/admin/customers          -> Customers
/admin/listings           -> All listings
/admin/orders             -> All orders
/admin/tickets            -> All support tickets
/admin/reports            -> Reports
/admin/settings           -> Currency/platform settings
/admin/audit-logs         -> Audit history
```

Use route loaders/guards to provide a good user experience: - Guest-only
routes redirect signed-in users to the correct role landing page. -
Protected routes show a loading state while `/me` is checked. -
Customer, vendor and Super Admin route groups redirect users who lack
the required role. - Backend 401/403 responses must still be handled
correctly.

## 3. Shared application shell

### Header

-   Brand mark/name on the left.
-   Main navigation appropriate to the user's role.
-   Search entry point on marketplace pages.
-   Currency display selector: TZS, USD, NGN.
-   Account menu with profile and logout.
-   Mobile menu with keyboard-accessible controls.

### Footer

-   Minimal brand and short description.
-   Links to terms, privacy, support/contact and relevant policies.
-   Copyright notice.
-   Do not imply Activision affiliation.

### Typography

Use Inter with a clear scale, for example: - Page title: 28--32px,
semibold. - Section heading: 20--24px, semibold. - Card/listing title:
16--18px, medium/semibold. - Body: 14--16px, regular. - Labels/helper
text: 12--14px. - Price: visually prominent but restrained.

Ensure line-height and contrast support readability. Use consistent
spacing and avoid too many font weights.

## 4. Customer pages

### 4.1 Login and registration

Login: - Email. - Password. - Remember me. - Forgot password. - Link to
registration. - Inline field validation and general error message.

Registration: - Name. - Email. - Phone (optional or required by product
decision). - Password and confirmation. - Terms acceptance if terms are
published. - Role is never selectable; backend assigns `customer`.

### 4.2 Marketplace home

-   Introductory heading and concise description.
-   Two primary category entry cards: CODM Accounts and CP.
-   Featured/available listings.
-   Vendor/store links.
-   Search.
-   Clear loading, empty and error states.

### 4.3 Account marketplace

Listing card: - Primary account image. - Title. - Short description. -
Vendor/store name. - Price and currency. - Availability label. - View
details action.

Filters: - Vendor. - Price range (optional first release). -
Availability (available only for customers). - Sort by newest/price.

Account detail: - Image gallery or main image. - Full description. -
Vendor information. - Price with optional estimated conversion. - Create
order action. - Clear notice that availability and fulfilment are
confirmed by the vendor.

### 4.4 CP marketplace

-   Shared CP category image.
-   Bundle amount, e.g. 2,400 CP.
-   Vendor name.
-   Price and currency.
-   Optional estimated converted price.
-   Availability.
-   Create order action.

Do not create a separate image upload for every CP bundle unless later
requirements call for it.

### 4.5 Order confirmation and history

Before creating the order, show: - Product/bundle. - Vendor. - Price and
currency. - A short explanation that the order will be recorded and the
customer can continue the conversation on WhatsApp.

After successful creation: - Show order reference and status. - Show
**Continue on WhatsApp**. - Show order detail and order history link.

Order history: - Paginated list. - Filter by status/date if useful. -
Order reference, date, item, vendor, total and status. - Detail page
with status timeline and WhatsApp action.

Do not mark an order as paid merely because the customer opened
WhatsApp.

### 4.6 Support tickets

Create ticket form: - Vendor selection (required). - Subject
(recommended). - Description (required, length-limited). - Evidence
image upload (optional, supported image formats only). - Submit button
and clear confirmation.

Customer ticket list: - Reference, vendor, date and status. - Detail
page with description, permitted messages and attachments. - Customer
sees only their own tickets.

## 5. Vendor portal

Vendor dashboard: - Today's completed sales count and value. -
Pending/processing order count. - Available account count. - Available
CP bundle count. - Recent orders. - Recent assigned tickets.

Inventory: - Tabs or clear sections for CODM accounts and CP bundles. -
Create/edit forms. - Status controls. - Sold action for accounts with
confirmation. - Unpublish/archive action. - Image preview and
validation. - Vendor sees only their own inventory.

Orders: - Paginated order list. - Reference, customer display details as
permitted, item, amount, date and status. - Order detail with valid
status transitions. - Complete action with confirmation. - Avoid
exposing unnecessary customer personal data.

Tickets: - Only tickets assigned to the signed-in vendor. - Ticket
details and permitted response/status controls.

## 6. Super Admin portal

Dashboard: - Total customers. - Active vendors. - Available listings. -
Orders today. - Completed sales today (count and value). - Pending
orders. - Open tickets. - Recent activity.

Management pages: - Vendor creation/edit/suspension. - Customer list. -
All listings and orders. - All tickets. - Currency rate management. -
Reports and audit logs.

Super Admin should be able to filter reports by vendor and date range.

## 7. Search behavior

-   Debounce input (e.g. 250--350ms).
-   Search through the Laravel API; do not download the entire inventory
    to filter in the browser.
-   Support keyboard navigation and clear action.
-   Show suggestions/results only from authorized, available listings.
-   Provide an empty state and a link to clear filters.
-   Cancel or ignore stale requests so older results do not overwrite
    newer search results.

## 8. Currency selector

The selector changes display currency only. It must not alter the
authoritative order price.

For each listing: - Show original price clearly. - Show converted
estimate secondarily, e.g. `≈ $25.00 USD`. - Add "Estimated conversion"
and rate freshness information in a suitable place. - If conversion data
is unavailable, show original price only.

## 9. Image upload UX

For account listings and ticket evidence: - Accept only approved image
formats (e.g. JPEG, PNG, WebP). - Set a reasonable maximum file size and
image dimension limit. - Validate file extension and actual MIME/content
on the server. - Show local preview before submission. - Show upload
progress and clear errors. - Never trust the browser's `accept`
attribute as validation. - For tickets, uploaded evidence is private and
visible only to authorized ticket participants.

## 10. Accessibility and responsive behavior

-   Semantic headings and landmarks.
-   Every input has a label.
-   Keyboard-accessible menus, dialogs and dropdowns.
-   Visible focus indicators.
-   Accessible status text; do not rely on color alone.
-   Responsive layouts for small phones, tablets and desktop.
-   Tables should become usable cards or horizontally scrollable regions
    on narrow screens.
-   Respect reduced-motion preferences.

## 11. Reusable component checklist

Implement and reuse: - `AppShell`, `Header`, `Footer`, `Sidebar` -
`Button`, `Input`, `Textarea`, `Select`, `Checkbox` - `FormField`,
`FieldError`, `ImageUploader` - `ListingCard`, `CPBundleCard`,
`PriceDisplay` - `StatusBadge`, `ConfirmDialog`, `Toast` -
`SearchInput`, `FilterBar`, `Pagination` - `DataTable`, `EmptyState`,
`LoadingState`, `ErrorState` - `OrderSummary`, `OrderStatusTimeline`,
`TicketAttachmentList`

Keep components focused. Avoid giant components that combine API calls,
validation, routing, and rendering in one file.
