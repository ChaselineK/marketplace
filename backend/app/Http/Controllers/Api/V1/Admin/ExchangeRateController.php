<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateExchangeRateRequest;
use App\Http\Resources\ExchangeRateResource;
use App\Models\ExchangeRate;
use Illuminate\Http\JsonResponse;

class ExchangeRateController extends Controller
{
    /**
     * List all exchange rates.
     */
    public function index(): JsonResponse
    {
        $rates = ExchangeRate::orderBy('quote_currency', 'asc')->get();

        return response()->json([
            'data' => ExchangeRateResource::collection($rates),
        ]);
    }

    /**
     * Update or create an exchange rate for a currency pair.
     */
    public function update(UpdateExchangeRateRequest $request): JsonResponse
    {
        $rate = ExchangeRate::updateOrCreate(
            [
                'base_currency' => $request->validated('base_currency'),
                'quote_currency' => $request->validated('quote_currency'),
            ],
            [
                'rate' => $request->validated('rate'),
                'source' => $request->validated('source', 'Admin Managed'),
                'effective_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Exchange rate updated successfully.',
            'data' => new ExchangeRateResource($rate),
        ]);
    }
}

