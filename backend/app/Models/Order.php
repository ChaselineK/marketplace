<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'public_reference',
        'customer_id',
        'vendor_id',
        'item_type',
        'account_listing_id',
        'cp_bundle_id',
        'item_title_snapshot',
        'item_description_snapshot',
        'quantity',
        'unit_price_amount',
        'price_currency',
        'total_price_amount',
        'status',
        'whatsapp_opened_at',
        'completed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'quantity' => 'integer',
        'unit_price_amount' => 'float',
        'total_price_amount' => 'float',
        'whatsapp_opened_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function accountListing(): BelongsTo
    {
        return $this->belongsTo(AccountListing::class, 'account_listing_id');
    }

    public function cpBundle(): BelongsTo
    {
        return $this->belongsTo(CpBundle::class, 'cp_bundle_id');
    }

    /**
     * Generate the server-derived WhatsApp click-to-chat handoff URL.
     */
    public function getWhatsappHandoffUrlAttribute(): ?string
    {
        $vendorNumber = $this->vendor?->vendorProfile?->whatsapp_number;
        if (! $vendorNumber) {
            return null;
        }

        $formattedTotal = $this->price_currency . ' ' . number_format($this->total_price_amount);
        $message = "Hello {$this->vendor->vendorProfile?->store_name},\n"
            . "I placed an order on WILRICH STORE.\n\n"
            . "Order Reference: {$this->public_reference}\n"
            . "Item: {$this->item_title_snapshot} (Qty: {$this->quantity})\n"
            . "Agreed Price: {$formattedTotal}\n\n"
            . "Please confirm availability and credential/item handover instructions.";

        return "https://wa.me/{$vendorNumber}?text=" . urlencode($message);
    }
}

