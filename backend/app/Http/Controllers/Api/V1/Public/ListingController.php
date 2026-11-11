<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\ListingStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\AccountListingResource;
use App\Models\AccountListing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListingController extends Controller
{
    /**
     * List all published, available account listings for the marketplace.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AccountListing::available()
            ->whereHas('vendor', function ($q) {
                $q->where('is_active', true)
                    ->whereHas('vendorProfile', function ($vp) {
                        $vp->where('is_published', true);
                    });
            })
            ->with(['vendor.vendorProfile', 'primaryImage', 'images']);

        // Text search
        if ($search = $request->input('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by vendor slug or ID
        if ($vendorSlug = $request->input('vendor_slug')) {
            $query->whereHas('vendor.vendorProfile', function ($q) use ($vendorSlug) {
                $q->where('store_slug', $vendorSlug);
            });
        } elseif ($vendorId = $request->input('vendor_id')) {
            $query->where('vendor_id', $vendorId);
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        match ($sort) {
            'price_asc' => $query->orderBy('price_amount', 'asc'),
            'price_desc' => $query->orderBy('price_amount', 'desc'),
            default => $query->latest(),
        };

        $listings = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'data' => AccountListingResource::collection($listings),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
            ],
        ]);
    }

    /**
     * Display a specific account listing.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $listing = AccountListing::with(['vendor.vendorProfile', 'images'])->findOrFail($id);

        $user = $request->user();
        $canView = $listing->status === ListingStatus::PUBLISHED
            || ($user && ($user->isSuperAdmin() || $user->id === $listing->vendor_id));

        if (! $canView) {
            return response()->json([
                'message' => 'This account listing is no longer available.',
            ], 404);
        }

        return response()->json([
            'data' => new AccountListingResource($listing),
        ]);
    }
}

