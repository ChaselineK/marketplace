<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\VendorProfileResource;
use App\Models\VendorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VendorStorefrontController extends Controller
{
    /**
     * Display a listing of published, active vendor storefronts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = VendorProfile::where('is_published', true)
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })
            ->with('user');

        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('store_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $vendors = $query->latest()->paginate($request->integer('per_page', 12));

        return response()->json([
            'data' => VendorProfileResource::collection($vendors),
            'meta' => [
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
                'per_page' => $vendors->perPage(),
                'total' => $vendors->total(),
            ],
        ]);
    }

    /**
     * Display the specified vendor storefront by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $vendor = VendorProfile::where('store_slug', $slug)
            ->where('is_published', true)
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })
            ->with('user')
            ->firstOrFail();

        return response()->json([
            'data' => new VendorProfileResource($vendor),
        ]);
    }
}

