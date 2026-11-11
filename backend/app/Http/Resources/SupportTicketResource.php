<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketResource extends JsonResource
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
            'subject' => $this->subject,
            'description' => $this->description,
            'status' => $this->status instanceof \App\Enums\TicketStatus ? $this->status->value : $this->status,
            'priority' => $this->priority instanceof \App\Enums\TicketPriority ? $this->priority->value : $this->priority,
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'customer' => $this->whenLoaded('customer', function () {
                return [
                    'id' => $this->customer->id,
                    'name' => $this->customer->name,
                    'email' => $this->customer->email,
                ];
            }),
            'vendor' => $this->whenLoaded('vendor', function () {
                return [
                    'id' => $this->vendor->id,
                    'name' => $this->vendor->name,
                    'store_name' => $this->vendor->vendorProfile?->store_name,
                    'store_slug' => $this->vendor->vendorProfile?->store_slug,
                    'whatsapp_number' => $this->vendor->vendorProfile?->whatsapp_number,
                ];
            }),
            'order' => $this->whenLoaded('order', function () {
                return [
                    'id' => $this->order->id,
                    'public_reference' => $this->order->public_reference,
                    'item_title_snapshot' => $this->order->item_title_snapshot,
                    'total_price_amount' => $this->order->total_price_amount,
                    'price_currency' => $this->order->price_currency,
                    'status' => $this->order->status instanceof \App\Enums\OrderStatus ? $this->order->status->value : $this->order->status,
                ];
            }),
            'messages' => SupportTicketMessageResource::collection($this->whenLoaded('messages')),
            'attachments' => SupportTicketAttachmentResource::collection($this->whenLoaded('attachments')),
        ];
    }
}

