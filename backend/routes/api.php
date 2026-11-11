<?php

use App\Http\Controllers\Api\V1\Admin\AdminAuditLogController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminTicketController;
use App\Http\Controllers\Api\V1\Admin\ExchangeRateController;
use App\Http\Controllers\Api\V1\Admin\VendorManagementController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Customer\CustomerOrderController;
use App\Http\Controllers\Api\V1\Customer\CustomerTicketController;
use App\Http\Controllers\Api\V1\Public\CpMarketplaceController;
use App\Http\Controllers\Api\V1\Public\CurrencyController;
use App\Http\Controllers\Api\V1\Public\ListingController;
use App\Http\Controllers\Api\V1\Public\VendorStorefrontController;
use App\Http\Controllers\Api\V1\TicketAttachmentController;
use App\Http\Controllers\Api\V1\Vendor\VendorCpController;
use App\Http\Controllers\Api\V1\Vendor\VendorDashboardController;
use App\Http\Controllers\Api\V1\Vendor\VendorListingController;
use App\Http\Controllers\Api\V1\Vendor\VendorOrderController;
use App\Http\Controllers\Api\V1\Vendor\VendorProfileController;
use App\Http\Controllers\Api\V1\Vendor\VendorTicketController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| WILRICH STORE - API v1 Routes
|--------------------------------------------------------------------------
*/

// Public Health
Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'WILRICH STORE API v1 is active',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Guest Auth with Rate Limiting (10 attempts / min)
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public / Customer Vendor Storefronts
Route::get('/vendors', [VendorStorefrontController::class, 'index']);
Route::get('/vendors/{slug}', [VendorStorefrontController::class, 'show']);

// Public / Customer Account Listings
Route::get('/listings', [ListingController::class, 'index']);
Route::get('/listings/{id}', [ListingController::class, 'show']);

// Public / Customer CP Bundles & Currency Rates
Route::get('/cp-bundles', [CpMarketplaceController::class, 'index']);
Route::get('/currency-rates', [CurrencyController::class, 'rates']);

// Authenticated User
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/test-protected', function (Request $request) {
        return response()->json([
            'status' => 'authenticated',
            'message' => 'You are authenticated with WILRICH STORE API',
            'user' => $request->user(),
        ]);
    });

    // Customer Orders
    Route::middleware('role:customer')->group(function () {
        Route::get('/customer/portal-check', function (Request $request) {
            return response()->json([
                'status' => 'authorized',
                'portal' => 'customer',
                'user' => $request->user(),
            ]);
        });

        Route::get('/orders', [CustomerOrderController::class, 'index']);
        Route::post('/orders', [CustomerOrderController::class, 'store'])->middleware('throttle:orders');
        Route::get('/orders/{reference}', [CustomerOrderController::class, 'show']);
        Route::post('/orders/{reference}/cancel', [CustomerOrderController::class, 'cancel']);
        Route::post('/orders/{reference}/whatsapp-opened', [CustomerOrderController::class, 'markWhatsappOpened']);

        // Customer Support Tickets
        Route::get('/tickets', [CustomerTicketController::class, 'index']);
        Route::post('/tickets', [CustomerTicketController::class, 'store'])->middleware('throttle:orders');
        Route::get('/tickets/{reference}', [CustomerTicketController::class, 'show']);
        Route::post('/tickets/{reference}/messages', [CustomerTicketController::class, 'reply']);
        Route::post('/tickets/{reference}/close', [CustomerTicketController::class, 'close']);
    });

    // Private attachment access (authorized by SupportTicketPolicy)
    Route::get('/tickets/{reference}/attachments/{attachment}/download', [TicketAttachmentController::class, 'download']);

    // Vendor Role Group
    Route::middleware('role:vendor')->prefix('vendor')->group(function () {
        Route::get('/portal-check', function (Request $request) {
            return response()->json([
                'status' => 'authorized',
                'portal' => 'vendor',
                'user' => $request->user(),
            ]);
        });

        // Storefront Profile Management
        Route::get('/profile', [VendorProfileController::class, 'show']);
        Route::patch('/profile', [VendorProfileController::class, 'update']);

        // Account Listings Management
        Route::get('/account-listings', [VendorListingController::class, 'index']);
        Route::post('/account-listings', [VendorListingController::class, 'store']);
        Route::get('/account-listings/{accountListing}', [VendorListingController::class, 'show']);
        Route::patch('/account-listings/{accountListing}', [VendorListingController::class, 'update']);
        Route::delete('/account-listings/{accountListing}', [VendorListingController::class, 'destroy']);
        Route::post('/account-listings/{accountListing}/mark-sold', [VendorListingController::class, 'markSold']);
        Route::post('/account-listings/{accountListing}/images', [VendorListingController::class, 'uploadImage']);
        Route::delete('/account-listings/{accountListing}/images/{image}', [VendorListingController::class, 'deleteImage']);

        // CP Bundles Management
        Route::get('/cp-bundles', [VendorCpController::class, 'index']);
        Route::post('/cp-bundles', [VendorCpController::class, 'store']);
        Route::get('/cp-bundles/{cpBundle}', [VendorCpController::class, 'show']);
        Route::patch('/cp-bundles/{cpBundle}', [VendorCpController::class, 'update']);
        Route::delete('/cp-bundles/{cpBundle}', [VendorCpController::class, 'destroy']);

        // Vendor Orders Queue & Processing
        Route::get('/orders', [VendorOrderController::class, 'index']);
        Route::get('/orders/{order}', [VendorOrderController::class, 'show']);
        Route::patch('/orders/{order}/status', [VendorOrderController::class, 'updateStatus']);

        // Vendor Support Tickets
        Route::get('/tickets', [VendorTicketController::class, 'index']);
        Route::get('/tickets/{reference}', [VendorTicketController::class, 'show']);
        Route::patch('/tickets/{reference}', [VendorTicketController::class, 'update']);
        Route::post('/tickets/{reference}/messages', [VendorTicketController::class, 'reply']);

        // Vendor Dashboard Aggregates & Daily Reporting
        Route::get('/dashboard', [VendorDashboardController::class, 'index']);
    });

    // Super Admin Role Group
    Route::middleware('role:super_admin')->prefix('admin')->group(function () {
        Route::get('/portal-check', function (Request $request) {
            return response()->json([
                'status' => 'authorized',
                'portal' => 'admin',
                'user' => $request->user(),
            ]);
        });

        // Super Admin Dashboard & Daily Reporting
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);
        Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);

        Route::get('/vendors', [VendorManagementController::class, 'index']);
        Route::post('/vendors', [VendorManagementController::class, 'store']);
        Route::get('/vendors/{vendor}', [VendorManagementController::class, 'show']);
        Route::patch('/vendors/{vendor}/toggle-status', [VendorManagementController::class, 'toggleStatus']);

        // Exchange Rates
        Route::get('/exchange-rates', [ExchangeRateController::class, 'index']);
        Route::patch('/exchange-rates', [ExchangeRateController::class, 'update']);

        // Platform Orders
        Route::get('/orders', [AdminOrderController::class, 'index']);

        // Platform Support Tickets
        Route::get('/tickets', [AdminTicketController::class, 'index']);
        Route::get('/tickets/{reference}', [AdminTicketController::class, 'show']);
        Route::patch('/tickets/{reference}', [AdminTicketController::class, 'update']);
        Route::post('/tickets/{reference}/messages', [AdminTicketController::class, 'reply']);
    });
});
