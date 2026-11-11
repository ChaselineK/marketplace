<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class OrderPolicy
{
    /**
     * Determine whether the user can view the order.
     */
    public function view(User $user, Order $order): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->id === $order->customer_id || $user->id === $order->vendor_id;
    }

    /**
     * Determine whether the user can transition the order status.
     */
    public function transition(User $user, Order $order): Response
    {
        if ($user->isSuperAdmin() || $user->id === $order->vendor_id) {
            return Response::allow();
        }

        return Response::deny('Only the assigned vendor or Super Admin can manage this order.');
    }

    /**
     * Determine whether the user can cancel the order.
     */
    public function cancel(User $user, Order $order): Response
    {
        if ($user->isSuperAdmin() || $user->id === $order->vendor_id) {
            return Response::allow();
        }

        if ($user->id === $order->customer_id) {
            if ($order->status === OrderStatus::PENDING) {
                return Response::allow();
            }
            return Response::deny('Orders can only be cancelled while in pending status.');
        }

        return Response::deny('You do not have permission to cancel this order.');
    }
}

