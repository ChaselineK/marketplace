<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExchangeRateResource;
use App\Models\ExchangeRate;
use Illuminate\Http\JsonResponse;

class CurrencyController extends Controller
{
    /**
     * Get the current exchange rates table.
     */
    public function rates(): JsonResponse
    {
        $rates = ExchangeRate::all();

        return response()->json([
            'base_currency' => 'TZS',
            'supported_currencies' => ['TZS', 'USD', 'NGN'],
            'rates' => ExchangeRateResource::collection($rates),
            'last_updated' => $rates->max('effective_at')?->toIso8601String() ?? now()->toIso8601String(),
        ]);
    }
}

