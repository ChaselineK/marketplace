<?php

namespace App\Actions\Orders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\AuditLogService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TransitionOrderStatusAction
{
    /**
     * Transition order status safely and idempotently.
     *
     * @throws ValidationException
     */
    public function execute(Order $order, OrderStatus $targetStatus): Order
    {
        return DB::transaction(function () use ($order, $targetStatus) {
            // Idempotent check for completion
            if ($order->status === OrderStatus::COMPLETED && $targetStatus === OrderStatus::COMPLETED) {
                return $order;
            }

            if ($order->status === OrderStatus::CANCELLED && $targetStatus === OrderStatus::CANCELLED) {
                return $order;
            }

            // Invariant: cannot transition from terminal states
            if ($order->status === OrderStatus::COMPLETED && $targetStatus !== OrderStatus::COMPLETED) {
                throw ValidationException::withMessages([
                    'status' => 'Completed orders cannot change status.',
                ]);
            }

            if ($order->status === OrderStatus::CANCELLED && $targetStatus !== OrderStatus::CANCELLED) {
                throw ValidationException::withMessages([
                    'status' => 'Cancelled orders cannot be reopened.',
                ]);
            }

            // Update attributes
            $updates = ['status' => $targetStatus];

            if ($targetStatus === OrderStatus::COMPLETED) {
                if (! $order->completed_at) {
                    $updates['completed_at'] = now();
                }

                // If account order, mark the account sold in the same transaction
                if ($order->item_type === 'account' && $order->accountListing) {
                    $order->accountListing->markAsSold();
                }
            } elseif ($targetStatus === OrderStatus::CANCELLED) {
                if (! $order->cancelled_at) {
                    $updates['cancelled_at'] = now();
                }
            }

            $order->update($updates);

            AuditLogService::log(
                Auth::user(),
                'order.status_transitioned',
                $order,
                [
                    'public_reference' => $order->public_reference,
                    'old_status' => $order->getOriginal('status') instanceof OrderStatus ? $order->getOriginal('status')->value : $order->getOriginal('status'),
                    'new_status' => $targetStatus->value,
                    'total_price_amount' => $order->total_price_amount,
                ]
            );

            return $order->load(['vendor.vendorProfile', 'customer']);
        });
    }
}
