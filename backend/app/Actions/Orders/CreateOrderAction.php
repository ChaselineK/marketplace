<?php

namespace App\Actions\Orders;

use App\Enums\ListingStatus;
use App\Enums\OrderStatus;
use App\Models\AccountListing;
use App\Models\CpBundle;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateOrderAction
{
    /**
     * Create an order transactionally with strict availability and concurrency checks.
     *
     * @throws ValidationException
     */
    public function execute(User $customer, string $itemType, int $itemId, int $quantity = 1): Order
    {
        return DB::transaction(function () use ($customer, $itemType, $itemId, $quantity) {
            if ($itemType === 'account') {
                return $this->createAccountOrder($customer, $itemId);
            }

            if ($itemType === 'cp_bundle') {
                return $this->createCpBundleOrder($customer, $itemId, $quantity);
            }

            throw ValidationException::withMessages([
                'item_type' => 'Unsupported item type.',
            ]);
        });
    }

    private function createAccountOrder(User $customer, int $listingId): Order
    {
        // Lock the listing row to prevent race conditions
        /** @var AccountListing|null $listing */
        $listing = AccountListing::lockForUpdate()->find($listingId);

        if (! $listing || $listing->status !== ListingStatus::PUBLISHED) {
            throw ValidationException::withMessages([
                'item_id' => 'This CODM account is no longer available.',
            ]);
        }

        // Prevent duplicate active orders for the unique account
        $activeOrderExists = Order::where('account_listing_id', $listing->id)
            ->whereIn('status', [OrderStatus::PENDING, OrderStatus::PROCESSING])
            ->exists();

        if ($activeOrderExists) {
            throw ValidationException::withMessages([
                'item_id' => 'This account currently has a pending order reserved by another customer.',
            ]);
        }

        $ref = $this->generateReference();

        $order = Order::create([
            'public_reference' => $ref,
            'customer_id' => $customer->id,
            'vendor_id' => $listing->vendor_id,
            'item_type' => 'account',
            'account_listing_id' => $listing->id,
            'cp_bundle_id' => null,
            'item_title_snapshot' => $listing->title,
            'item_description_snapshot' => $listing->description,
            'quantity' => 1,
            'unit_price_amount' => $listing->price_amount,
            'price_currency' => $listing->price_currency,
            'total_price_amount' => $listing->price_amount,
            'status' => OrderStatus::PENDING,
        ]);

        return $order->load(['vendor.vendorProfile', 'customer']);
    }

    private function createCpBundleOrder(User $customer, int $bundleId, int $quantity): Order
    {
        if ($quantity < 1 || $quantity > 20) {
            throw ValidationException::withMessages([
                'quantity' => 'Quantity must be between 1 and 20.',
            ]);
        }

        /** @var CpBundle|null $bundle */
        $bundle = CpBundle::find($bundleId);

        if (! $bundle || $bundle->status !== 'published') {
            throw ValidationException::withMessages([
                'item_id' => 'This CP bundle is currently unavailable.',
            ]);
        }

        $total = $bundle->price_amount * $quantity;
        $ref = $this->generateReference();

        $order = Order::create([
            'public_reference' => $ref,
            'customer_id' => $customer->id,
            'vendor_id' => $bundle->vendor_id,
            'item_type' => 'cp_bundle',
            'account_listing_id' => null,
            'cp_bundle_id' => $bundle->id,
            'item_title_snapshot' => $bundle->formatted_title,
            'item_description_snapshot' => "CODM In-game Currency Bundle ({$bundle->formatted_title})",
            'quantity' => $quantity,
            'unit_price_amount' => $bundle->price_amount,
            'price_currency' => $bundle->price_currency,
            'total_price_amount' => $total,
            'status' => OrderStatus::PENDING,
        ]);

        return $order->load(['vendor.vendorProfile', 'customer']);
    }

    private function generateReference(): string
    {
        do {
            $ref = 'WS-' . date('Y') . '-' . strtoupper(Str::random(6));
        } while (Order::where('public_reference', $ref)->exists());

        return $ref;
    }
}

