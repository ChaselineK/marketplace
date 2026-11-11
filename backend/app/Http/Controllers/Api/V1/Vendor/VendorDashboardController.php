<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Enums\ListingStatus;
use App\Enums\OrderStatus;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\AccountListing;
use App\Models\CpBundle;
use App\Models\Order;
use App\Models\SupportTicket;
use App\Services\DailyReportingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorDashboardController extends Controller
{
    /**
     * Get vendor dashboard aggregate metrics and sales reporting.
     */
    public function index(Request $request): JsonResponse
    {
        $vendor = $request->user();
        $dateParam = $request->input('date'); // optional YYYY-MM-DD in Africa/Dar_es_Salaam

        $dailySales = DailyReportingService::getDailySales($dateParam, $vendor->id);
        $allTimeSales = DailyReportingService::getAllTimeSales($vendor->id);

        $inventoryCounts = [
            'accounts_published' => AccountListing::where('vendor_id', $vendor->id)
                ->where('status', ListingStatus::PUBLISHED)
                ->count(),
            'accounts_sold' => AccountListing::where('vendor_id', $vendor->id)
                ->where('status', ListingStatus::SOLD)
                ->count(),
            'accounts_total' => AccountListing::where('vendor_id', $vendor->id)->count(),
            'cp_bundles_total' => CpBundle::where('vendor_id', $vendor->id)->count(),
        ];

        $ordersCounts = [
            'pending' => Order::where('vendor_id', $vendor->id)->where('status', OrderStatus::PENDING)->count(),
            'processing' => Order::where('vendor_id', $vendor->id)->where('status', OrderStatus::PROCESSING)->count(),
            'completed' => Order::where('vendor_id', $vendor->id)->where('status', OrderStatus::COMPLETED)->count(),
            'cancelled' => Order::where('vendor_id', $vendor->id)->where('status', OrderStatus::CANCELLED)->count(),
            'total' => Order::where('vendor_id', $vendor->id)->count(),
        ];

        $ticketsCounts = [
            'open' => SupportTicket::where('vendor_id', $vendor->id)->where('status', TicketStatus::OPEN)->count(),
            'in_progress' => SupportTicket::where('vendor_id', $vendor->id)->where('status', TicketStatus::IN_PROGRESS)->count(),
            'waiting_for_customer' => SupportTicket::where('vendor_id', $vendor->id)->where('status', TicketStatus::WAITING_FOR_CUSTOMER)->count(),
            'resolved' => SupportTicket::where('vendor_id', $vendor->id)->where('status', TicketStatus::RESOLVED)->count(),
            'closed' => SupportTicket::where('vendor_id', $vendor->id)->where('status', TicketStatus::CLOSED)->count(),
        ];

        $recentOrders = Order::where('vendor_id', $vendor->id)
            ->with(['customer'])
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'daily_sales' => $dailySales,
                'all_time_sales' => $allTimeSales,
                'inventory' => $inventoryCounts,
                'orders' => $ordersCounts,
                'tickets' => $ticketsCounts,
                'recent_orders' => OrderResource::collection($recentOrders),
            ],
        ]);
    }
}

