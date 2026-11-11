<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CpBundleResource;
use App\Models\CpBundle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CpMarketplaceController extends Controller
{
    /**
     * Display a listing of available CP bundles across vendors.
     */
    public function index(Request $request): JsonResponse
    {
        $query = CpBundle::available()
            ->whereHas('vendor', function ($q) {
                $q->where('is_active', true)
                    ->whereHas('vendorProfile', function ($vp) {
                        $vp->where('is_published', true);
                    });
            })
            ->with('vendor.vendorProfile');

        if ($vendorSlug = $request->input('vendor_slug')) {
            $query->whereHas('vendor.vendorProfile', function ($q) use ($vendorSlug) {
                $q->where('store_slug', $vendorSlug);
            });
        }

        if ($cpAmount = $request->input('cp_amount')) {
            $query->where('cp_amount', $cpAmount);
        }

        $bundles = $query->orderBy('cp_amount', 'asc')
            ->orderBy('price_amount', 'asc')
            ->paginate($request->integer('per_page', 24));

        return response()->json([
            'data' => CpBundleResource::collection($bundles),
            'meta' => [
                'current_page' => $bundles->currentPage(),
                'last_page' => $bundles->lastPage(),
                'per_page' => $bundles->perPage(),
                'total' => $bundles->total(),
            ],
        ]);
    }
}

