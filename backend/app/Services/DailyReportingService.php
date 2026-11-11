<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DailyReportingService
{
    public const BUSINESS_TIMEZONE = 'Africa/Dar_es_Salaam';

    /**
     * Get UTC date boundary for a given local date string in Africa/Dar_es_Salaam.
     *
     * @return array{0: Carbon, 1: Carbon, 2: string}
     */
    public static function getUtcDateRange(?string $localDate = null): array
    {
        $dateStr = $localDate ?: Carbon::now(self::BUSINESS_TIMEZONE)->toDateString();

        $startLocal = Carbon::parse($dateStr, self::BUSINESS_TIMEZONE)->startOfDay();
        $endLocal = Carbon::parse($dateStr, self::BUSINESS_TIMEZONE)->endOfDay();

        $startUtc = $startLocal->copy()->setTimezone('UTC');
        $endUtc = $endLocal->copy()->setTimezone('UTC');

        return [$startUtc, $endUtc, $dateStr];
    }

    /**
     * Calculate completed sales for a business day in Africa/Dar_es_Salaam.
     */
    public static function getDailySales(?string $localDate = null, ?int $vendorId = null): array
    {
        [$startUtc, $endUtc, $dateStr] = self::getUtcDateRange($localDate);

        $query = Order::where('status', OrderStatus::COMPLETED)
            ->whereBetween('completed_at', [$startUtc, $endUtc]);

        if ($vendorId !== null) {
            $query->where('vendor_id', $vendorId);
        }

        $count = (int) $query->count();
        $totalAmount = (float) $query->sum('total_price_amount');

        return [
            'date' => $dateStr,
            'timezone' => self::BUSINESS_TIMEZONE,
            'completed_orders_count' => $count,
            'total_sales_amount' => $totalAmount,
            'currency' => 'TZS',
            'range_utc' => [
                'start' => $startUtc->toIso8601String(),
                'end' => $endUtc->toIso8601String(),
            ],
        ];
    }

    /**
     * Calculate all-time completed sales volume.
     */
    public static function getAllTimeSales(?int $vendorId = null): array
    {
        $query = Order::where('status', OrderStatus::COMPLETED);

        if ($vendorId !== null) {
            $query->where('vendor_id', $vendorId);
        }

        return [
            'completed_orders_count' => (int) $query->count(),
            'total_sales_amount' => (float) $query->sum('total_price_amount'),
            'currency' => 'TZS',
        ];
    }

    /**
     * Get vendor sales breakdown for Super Admin.
     */
    public static function getVendorBreakdown(?string $localDate = null): Collection
    {
        [$startUtc, $endUtc, $dateStr] = self::getUtcDateRange($localDate);

        $vendors = User::where('role', 'vendor')->with('vendorProfile')->get();

        return $vendors->map(function ($vendor) use ($startUtc, $endUtc, $dateStr) {
            $dailyQuery = Order::where('vendor_id', $vendor->id)
                ->where('status', OrderStatus::COMPLETED)
                ->whereBetween('completed_at', [$startUtc, $endUtc]);

            $allTimeQuery = Order::where('vendor_id', $vendor->id)
                ->where('status', OrderStatus::COMPLETED);

            return [
                'vendor_id' => $vendor->id,
                'name' => $vendor->name,
                'store_name' => $vendor->vendorProfile?->store_name ?: $vendor->name,
                'store_slug' => $vendor->vendorProfile?->store_slug,
                'today_orders_count' => (int) $dailyQuery->count(),
                'today_sales_amount' => (float) $dailyQuery->sum('total_price_amount'),
                'all_time_orders_count' => (int) $allTimeQuery->count(),
                'all_time_sales_amount' => (float) $allTimeQuery->sum('total_price_amount'),
            ];
        });
    }

    /**
     * Get dynamic sales chart data for Super Admin dashboard.
     * Records all orders marked completed/sold as sales.
     */
    public static function getSalesChartData(int $days = 14): array
    {
        $now = Carbon::now(self::BUSINESS_TIMEZONE);
        $dailyPoints = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $day = $now->copy()->subDays($i);
            $dateStr = $day->toDateString();
            $startUtc = $day->copy()->startOfDay()->setTimezone('UTC');
            $endUtc = $day->copy()->endOfDay()->setTimezone('UTC');

            $dayQuery = Order::where('status', OrderStatus::COMPLETED)
                ->whereBetween('completed_at', [$startUtc, $endUtc]);

            $count = (int) $dayQuery->count();
            $amount = (float) $dayQuery->sum('total_price_amount');

            $dailyPoints[] = [
                'date' => $dateStr,
                'short_label' => $day->format('M j'),
                'day_name' => $day->format('D'),
                'orders_count' => $count,
                'sales_amount' => $amount,
                'is_today' => $i === 0,
            ];
        }

        // Category breakdown (completed sales)
        $accountSales = [
            'count' => (int) Order::where('status', OrderStatus::COMPLETED)->where('item_type', 'account')->count(),
            'amount' => (float) Order::where('status', OrderStatus::COMPLETED)->where('item_type', 'account')->sum('total_price_amount'),
        ];

        $cpSales = [
            'count' => (int) Order::where('status', OrderStatus::COMPLETED)->where('item_type', 'cp_bundle')->count(),
            'amount' => (float) Order::where('status', OrderStatus::COMPLETED)->where('item_type', 'cp_bundle')->sum('total_price_amount'),
        ];

        // Recent sold orders
        $recentSold = Order::where('status', OrderStatus::COMPLETED)
            ->with(['vendor.vendorProfile', 'customer'])
            ->latest('completed_at')
            ->limit(8)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'reference' => $order->public_reference,
                    'title' => $order->item_title_snapshot,
                    'item_type' => $order->item_type,
                    'quantity' => $order->quantity,
                    'total_price_amount' => $order->total_price_amount,
                    'price_currency' => $order->price_currency,
                    'completed_at' => $order->completed_at?->toIso8601String(),
                    'vendor_name' => $order->vendor?->vendorProfile?->store_name ?: $order->vendor?->name,
                    'customer_name' => $order->customer?->name,
                ];
            });

        return [
            'timeline' => $dailyPoints,
            'categories' => [
                'accounts' => $accountSales,
                'cp_bundles' => $cpSales,
            ],
            'recent_sold' => $recentSold,
        ];
    }
}

