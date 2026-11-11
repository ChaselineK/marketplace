<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CpBundle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vendor_id',
        'cp_amount',
        'price_amount',
        'price_currency',
        'description',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'cp_amount' => 'integer',
            'price_amount' => 'float',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('status', 'published');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'published';
    }

    public function getFormattedTitleAttribute(): string
    {
        return number_format($this->cp_amount) . ' CP';
    }
}

