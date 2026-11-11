<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\ListingStatus;
use App\Enums\OrderStatus;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AccountListing;
use App\Models\AuditLog;
use App\Models\CpBundle;
use App\Models\Order;
use App\Models\SupportTicket;
use App\Models\User;
use App\Services\DailyReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    /**
     * Get Super Admin dashboard aggregates and platform-wide metrics.
     */
    public function index(Request $request): JsonResponse
    {
        $dateParam = $request->input('date');
        $vendorId = $request->filled('vendor_id') ? $request->integer('vendor_id') : null;

        $dailySales = DailyReportingService::getDailySales($dateParam, $vendorId);
        $allTimeSales = DailyReportingService::getAllTimeSales($vendorId);
        $vendorBreakdown = DailyReportingService::getVendorBreakdown($dateParam);

        $platformTotals = [
            'total_vendors' => User::where('role', UserRole::VENDOR)->count(),
            'active_vendors' => User::where('role', UserRole::VENDOR)->where('is_active', true)->count(),
            'total_customers' => User::where('role', UserRole::CUSTOMER)->count(),
            'active_accounts' => AccountListing::where('status', ListingStatus::PUBLISHED)->count(),
            'sold_accounts' => AccountListing::where('status', ListingStatus::SOLD)->count(),
            'total_cp_bundles' => CpBundle::count(),
            'total_orders' => Order::count(),
            'completed_orders' => Order::where('status', OrderStatus::COMPLETED)->count(),
            'open_tickets' => SupportTicket::whereIn('status', [TicketStatus::OPEN, TicketStatus::IN_PROGRESS])->count(),
        ];

        $recentLogs = AuditLog::with('actor')
            ->latest('created_at')
            ->limit(10)
            ->get();

        $salesChart = DailyReportingService::getSalesChartData(14);

        return response()->json([
            'data' => [
                'daily_sales' => $dailySales,
                'all_time_sales' => $allTimeSales,
                'vendor_breakdown' => $vendorBreakdown,
                'platform_totals' => $platformTotals,
                'recent_audit_logs' => $recentLogs,
                'sales_chart' => $salesChart,
            ],
        ]);
    }
}

