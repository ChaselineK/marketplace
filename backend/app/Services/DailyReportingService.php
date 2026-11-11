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
}

