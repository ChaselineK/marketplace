<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vendor\UpdateVendorProfileRequest;
use App\Http\Resources\VendorProfileResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class VendorProfileController extends Controller
{
    /**
     * Get the authenticated vendor's storefront profile.
     */
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->vendorProfile;

        if (! $profile) {
            return response()->json([
                'message' => 'Vendor profile not found.',
            ], 404);
        }

        return response()->json([
            'data' => new VendorProfileResource($profile),
        ]);
    }

    /**
     * Update the authenticated vendor's storefront profile.
     */
    public function update(UpdateVendorProfileRequest $request): JsonResponse
    {
        $profile = $request->user()->vendorProfile;

        if (! $profile) {
            return response()->json([
                'message' => 'Vendor profile not found.',
            ], 404);
        }

        // Authorize with policy
        Gate::authorize('update', $profile);

        $profile->update($request->validated());

        return response()->json([
            'message' => 'Storefront profile updated successfully.',
            'data' => new VendorProfileResource($profile),
        ]);
    }
}
