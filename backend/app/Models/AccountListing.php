<?php

namespace App\Models;

use App\Enums\ListingStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountListing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'title',
        'description',
        'price_amount',
        'price_currency',
        'status',
        'sold_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ListingStatus::class,
            'price_amount' => 'float',
            'sold_at' => 'datetime',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(AccountListingImage::class)->orderBy('sort_order', 'asc');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(AccountListingImage::class)->ofMany('sort_order', 'min');
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', ListingStatus::PUBLISHED);
    }

    public function isAvailable(): bool
    {
        return $this->status === ListingStatus::PUBLISHED;
    }

    public function markAsSold(): void
    {
        $this->update([
            'status' => ListingStatus::SOLD,
            'sold_at' => now(),
        ]);
    }
}

