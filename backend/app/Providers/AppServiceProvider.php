<?php

namespace App\Providers;

use App\Models\AccountListing;
use App\Models\CpBundle;
use App\Models\Order;
use App\Models\SupportTicket;
use App\Models\VendorProfile;
use App\Policies\AccountListingPolicy;
use App\Policies\CpBundlePolicy;
use App\Policies\OrderPolicy;
use App\Policies\SupportTicketPolicy;
use App\Policies\VendorProfilePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(AccountListing::class, AccountListingPolicy::class);
        Gate::policy(CpBundle::class, CpBundlePolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(SupportTicket::class, SupportTicketPolicy::class);
        Gate::policy(VendorProfile::class, VendorProfilePolicy::class);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('orders', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });
    }
}
