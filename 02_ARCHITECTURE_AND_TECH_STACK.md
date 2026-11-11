# CODM Marketplace --- Architecture & Technical Decisions

## 1. Recommended architecture

Use a decoupled full-stack architecture:

-   **Frontend:** React.js single-page application.
-   **Backend:** Laravel REST API.
-   **Database:** PostgreSQL recommended (MySQL is also acceptable if
    the project standard requires it).
-   **Authentication:** Laravel Sanctum cookie-based SPA authentication.
-   **File storage:** Laravel filesystem abstraction; local
    private/public disks for development and S3-compatible object
    storage for production.
-   **WhatsApp:** Click-to-chat URL (`https://wa.me/`) for the initial
    release. Integrate WhatsApp Business Cloud API only if the business
    later needs server-initiated messages, templates, delivery status or
    webhooks.
-   **Deployment:** Serve frontend and API from the same registrable
    domain where possible, e.g. `app.example.com` and `api.example.com`,
    with Sanctum stateful-domain and CORS configuration aligned.

The frontend is a presentation/client application. Laravel is the source
of truth for authentication, authorization, validation, business rules,
order state, prices, inventory, ticket visibility and reporting.

## 2. Request flow

1.  React sends an HTTPS request to Laravel.
2.  Laravel authenticates the session and verifies CSRF for
    state-changing cookie-authenticated requests.
3.  Route middleware checks the user's role.
4.  A policy checks ownership/relationship-level access.
5.  Form Request validates input.
6.  A service/action executes the business operation, using a database
    transaction when multiple records or stock are affected.
7.  Laravel returns a consistent JSON response.
8.  React updates the affected screen using the response or refetches
    the relevant query.

Do not rely on frontend route guards as the security boundary.

## 3. Backend organization

Use clear Laravel conventions. Suggested organization:

``` text
app/
  Actions/
    Orders/
      CreateOrder.php
      CompleteOrder.php
    Listings/
      MarkAccountSold.php
  Enums/
    UserRole.php
    ListingStatus.php
    OrderStatus.php
    TicketStatus.php
  Http/
    Controllers/
      Api/V1/
        Auth/
        Customer/
        Vendor/
        Admin/
        Public/
    Middleware/
    Requests/
      Auth/
      Listings/
      Orders/
      Tickets/
    Resources/
      UserResource.php
      ListingResource.php
      OrderResource.php
      TicketResource.php
  Models/
  Policies/
  Services/
    Currency/
    WhatsApp/
    Reporting/
```

Keep controllers thin. Controllers should coordinate requests and
responses, not contain long business workflows. Use Form Requests for
validation, Policies for record-level authorization, Resources for API
serialization, and service/action classes for important business
operations.

Do not introduce unnecessary abstraction or a large number of generic
repositories. Prefer straightforward Eloquent relationships and focused
service/action classes.

## 4. Authentication and CSRF

Use Sanctum's SPA authentication mode for a first-party React
application.

Required setup concepts: - Configure stateful domains correctly. -
Configure CORS with credentials enabled and an explicit frontend origin;
never use wildcard origins with credentials. - Frontend obtains the CSRF
cookie from `/sanctum/csrf-cookie` before login. - Send requests with
credentials enabled. - Laravel session cookie should be Secure in
production, HttpOnly, and SameSite configured for the deployment
topology. - Use HTTPS in production. - Protect state-changing routes
with Laravel's CSRF middleware. - Use Laravel's password hashing and
standard password reset flow. - Apply rate limits to login,
registration, password reset and sensitive endpoints.

`@csrf` is a Blade directive used in Blade-rendered HTML forms. A React
SPA does not use Blade's `@csrf` directive. The equivalent protection in
this architecture is Sanctum's CSRF-cookie/session flow and Laravel CSRF
middleware. If a Blade form is ever added, use `@csrf` in that Blade
form.

Use a "Remember me" session option where appropriate. Do not store
plaintext passwords, session IDs, or long-lived bearer tokens in
localStorage/sessionStorage. Do not attempt to implement login
persistence by writing credentials into browser storage.

## 5. Frontend organization

Suggested React structure:

``` text
src/
  app/
    router/
    providers/
    layouts/
  api/
    client.js
    auth.js
    listings.js
    orders.js
    tickets.js
  components/
    ui/
      Button/
      Input/
      Select/
      Modal/
      Badge/
      DataTable/
      Pagination/
      FileUpload/
      SearchInput/
    layout/
      Header/
      Footer/
      Sidebar/
  features/
    auth/
    marketplace/
    accounts/
    cp/
    orders/
    tickets/
    vendor/
    admin/
  hooks/
  utils/
  styles/
```

Use React Router for client navigation. Use a consistent server-state
solution (e.g. TanStack Query) or a small, consistent API state layer.
Avoid duplicating server data in multiple unrelated global stores.

## 6. UI component principles

Create reusable, accessible components: - Button variants: primary,
secondary, danger, text; no gradients or glow. - Form controls with
label, helper text, error text and disabled state. - Image uploader with
preview, file constraints and upload progress. - Listing card and
listing detail layout. - Price display with original currency and
optional estimated conversion. - Status badge with accessible text. -
Search input with debounce and clear action. - Data table with loading,
empty and error states. - Confirmation dialog for destructive actions. -
Pagination component. - Toast/inline feedback for success and failure.

Use Inter via a reliable font package or self-hosted font files. Define
design tokens for typography, spacing, borders, radii, shadows and
colors.

## 7. Data synchronization

The database is authoritative. After an admin changes a listing: -
Commit the change in Laravel. - Return the updated resource. -
Invalidate/refetch affected frontend queries. - Ensure public listing
queries exclude unavailable/unpublished records. - Ensure order creation
rechecks availability on the server.

For near-real-time updates, begin with query invalidation/refetch after
mutations. Add Laravel broadcasting/WebSockets later only if real-time
multi-user updates are genuinely required. Do not claim a listing is
synchronized merely because React changed local state.

## 8. WhatsApp integration

For the first version, use a user-initiated click-to-chat link:

``` text
https://wa.me/<international_number>?text=<url_encoded_message>
```

Store phone numbers in normalized international format, digits only
(without `+`, spaces or punctuation) for link construction. Validate the
number server-side.

Prefilled message should include: - Marketplace name. - Order
reference. - Product/bundle name. - Agreed listing price and currency. -
A short instruction to confirm availability/fulfilment with the vendor.

Generate the message from server-returned order data, not arbitrary
client-supplied price or vendor number. Open WhatsApp only after the
order has been successfully created.

The initial click-to-chat flow does not send a message automatically and
does not require the WhatsApp Business API. The customer must press Send
in WhatsApp. Do not describe a `wa.me` redirect as a server-to-server
WhatsApp API message.

## 9. Security principles

-   HTTPS everywhere in production.
-   Validate and authorize on the backend.
-   Use Eloquent parameter binding; never concatenate untrusted SQL.
-   Escape user-generated content in React and avoid unsafe HTML
    rendering.
-   Validate image MIME/content and size; generate safe filenames.
-   Keep secrets in environment variables, never frontend source.
-   Apply rate limits to authentication, search if abused, ticket
    submissions and order creation.
-   Log security-relevant actions without logging passwords, tokens or
    sensitive credentials.
-   Use least privilege for database and storage credentials.
-   Back up database and uploaded files.
-   Use dependency updates and vulnerability scanning as part of
    maintenance.
