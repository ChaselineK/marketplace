<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_reference' => $this->public_reference,
            'customer_id' => $this->customer_id,
            'vendor_id' => $this->vendor_id,
            'item_type' => $this->item_type,
            'account_listing_id' => $this->account_listing_id,
            'cp_bundle_id' => $this->cp_bundle_id,
            'item_title_snapshot' => $this->item_title_snapshot,
            'item_description_snapshot' => $this->item_description_snapshot,
            'quantity' => (int) $this->quantity,
            'unit_price_amount' => (float) $this->unit_price_amount,
            'price_currency' => $this->price_currency,
            'total_price_amount' => (float) $this->total_price_amount,
            'status' => $this->status instanceof \App\Enums\OrderStatus ? $this->status->value : $this->status,
            'whatsapp_handoff_url' => $this->whatsapp_handoff_url,
            'whatsapp_opened_at' => $this->whatsapp_opened_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'vendor' => $this->whenLoaded('vendor', function () {
                return [
                    'id' => $this->vendor->id,
                    'name' => $this->vendor->name,
                    'store_name' => $this->vendor->vendorProfile?->store_name,
                    'store_slug' => $this->vendor->vendorProfile?->store_slug,
                    'whatsapp_number' => $this->vendor->vendorProfile?->whatsapp_number,
                ];
            }),
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'name' => $this->customer->name,
                    'email' => $this->customer->email,
                ];
            }),
        ];
    }
}

