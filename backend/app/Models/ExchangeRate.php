<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'base_currency',
        'quote_currency',
        'rate',
        'source',
        'effective_at',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'float',
            'effective_at' => 'datetime',
        ];
    }

    /**
     * Convert an amount from base currency to target currency using latest rate.
     */
    public static function convert(float $amount, string $from = 'TZS', string $to = 'USD'): ?float
    {
        if ($from === $to) {
            return $amount;
        }

        $rateRecord = self::where('base_currency', $from)
            ->where('quote_currency', $to)
            ->latest('effective_at')
            ->first();

        if ($rateRecord && $rateRecord->rate > 0) {
            return round($amount * $rateRecord->rate, 2);
        }

        return null;
    }
}

