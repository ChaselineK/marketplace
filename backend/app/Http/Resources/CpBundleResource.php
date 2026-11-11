<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CpBundleResource extends JsonResource
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
            'vendor_id' => $this->vendor_id,
            'cp_amount' => $this->cp_amount,
            'formatted_title' => $this->formatted_title,
            'price_amount' => (float) $this->price_amount,
            'price_currency' => $this->price_currency,
            'description' => $this->description,
            'status' => $this->status,
            'is_available' => $this->isAvailable(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'vendor' => $this->whenLoaded('vendor', function () {
                return [
                    'id' => $this->vendor->id,
                    'name' => $this->vendor->name,
                    'store_name' => $this->vendor->vendorProfile?->store_name,
                    'store_slug' => $this->vendor->vendorProfile?->store_slug,
                    'whatsapp_number' => $this->vendor->vendorProfile?->whatsapp_number,
                ];
            }),
        ];
    }
}

