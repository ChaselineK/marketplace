<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountListingResource extends JsonResource
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
            'title' => $this->title,
            'description' => $this->description,
            'price_amount' => (float) $this->price_amount,
            'price_currency' => $this->price_currency,
            'status' => $this->status instanceof \App\Enums\ListingStatus ? $this->status->value : $this->status,
            'is_available' => $this->isAvailable(),
            'sold_at' => $this->sold_at?->toIso8601String(),
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
            'images' => $this->whenLoaded('images', function () {
                return $this->images->map(fn ($img) => [
                    'id' => $img->id,
                    'url' => $img->url,
                    'alt_text' => $img->alt_text,
                    'sort_order' => $img->sort_order,
                ]);
            }),
            'primary_image_url' => $this->primaryImage?->url ?? $this->images->first()?->url,
        ];
    }
}

