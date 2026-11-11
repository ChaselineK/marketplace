<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Actions\Orders\TransitionOrderStatusAction;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class VendorOrderController extends Controller
{
    /**
     * List all orders assigned to the authenticated vendor.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::where('vendor_id', $request->user()->id)
            ->with(['customer', 'accountListing', 'cpBundle'])
            ->latest();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $orders = $query->paginate($request->integer('per_page', 15));

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
     * Display a specific assigned order.
     */
    public function show(Order $order): JsonResponse
    {
        Gate::authorize('view', $order);

        $order->load(['customer', 'accountListing', 'cpBundle']);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Update the status of an assigned order.
     */
    public function updateStatus(
        UpdateOrderStatusRequest $request,
        Order $order,
        TransitionOrderStatusAction $action
    ): JsonResponse {
        Gate::authorize('transition', $order);

        $targetStatus = OrderStatus::from($request->validated('status'));
        $updatedOrder = $action->execute($order, $targetStatus);

        return response()->json([
            'message' => "Order status updated to {$targetStatus->value}.",
            'data' => new OrderResource($updatedOrder),
        ]);
    }
}

