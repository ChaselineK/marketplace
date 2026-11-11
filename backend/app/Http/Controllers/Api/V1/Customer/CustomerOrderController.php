<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Actions\Orders\CreateOrderAction;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\CreateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class CustomerOrderController extends Controller
{
    /**
     * List authenticated customer's own orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::where('customer_id', $request->user()->id)
            ->with(['vendor.vendorProfile'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Store a new order transactionally.
     */
    public function store(CreateOrderRequest $request, CreateOrderAction $action): JsonResponse
    {
        $order = $action->execute(
            $request->user(),
            $request->validated('item_type'),
            (int) $request->validated('item_id'),
            (int) $request->validated('quantity', 1)
        );

        return response()->json([
            'message' => 'Order created successfully. You may continue to WhatsApp for fulfillment.',
            'data' => new OrderResource($order),
        ], 201);
    }

    /**
     * Display a specific order owned by the customer.
     */
    public function show(Request $request, string $reference): JsonResponse
    {
        $order = Order::where('public_reference', $reference)
            ->with(['vendor.vendorProfile', 'customer'])
            ->firstOrFail();

        Gate::authorize('view', $order);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Cancel an eligible pending order.
     */
    public function cancel(Request $request, string $reference): JsonResponse
    {
        $order = Order::where('public_reference', $reference)->firstOrFail();

        Gate::authorize('cancel', $order);

        $order->update([
            'status' => OrderStatus::CANCELLED,
            'cancelled_at' => now(),
        ]);

        return response()->json([
            'message' => 'Order cancelled successfully.',
            'data' => new OrderResource($order->load(['vendor.vendorProfile', 'customer'])),
        ]);
    }

    /**
     * Mark WhatsApp as opened for tracking (does not mark paid or completed).
     */
    public function markWhatsappOpened(Request $request, string $reference): JsonResponse
    {
        $order = Order::where('public_reference', $reference)->firstOrFail();

        Gate::authorize('view', $order);

        if (! $order->whatsapp_opened_at) {
            $order->update(['whatsapp_opened_at' => now()]);
        }

        return response()->json([
            'message' => 'WhatsApp handoff recorded.',
            'data' => new OrderResource($order->load(['vendor.vendorProfile', 'customer'])),
        ]);
    }
}

