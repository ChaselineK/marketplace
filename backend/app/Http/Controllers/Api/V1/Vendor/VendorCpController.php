<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cp\StoreCpBundleRequest;
use App\Http\Requests\Cp\UpdateCpBundleRequest;
use App\Http\Resources\CpBundleResource;
use App\Models\CpBundle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class VendorCpController extends Controller
{
    /**
     * List all CP bundles for the authenticated vendor.
     */
    public function index(Request $request): JsonResponse
    {
        $bundles = CpBundle::where('vendor_id', $request->user()->id)
            ->orderBy('cp_amount', 'asc')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => CpBundleResource::collection($bundles),
            'meta' => [
                'current_page' => $bundles->currentPage(),
                'last_page' => $bundles->lastPage(),
                'total' => $bundles->total(),
            ],
        ]);
    }

    /**
     * Create a new CP bundle for the authenticated vendor.
     */
    public function store(StoreCpBundleRequest $request): JsonResponse
    {
        $bundle = CpBundle::create([
            'vendor_id' => $request->user()->id,
            'cp_amount' => $request->validated('cp_amount'),
            'price_amount' => $request->validated('price_amount'),
            'price_currency' => $request->validated('price_currency', 'TZS'),
            'description' => $request->validated('description'),
            'status' => $request->validated('status', 'published'),
        ]);

        return response()->json([
            'message' => 'CP bundle created successfully.',
            'data' => new CpBundleResource($bundle),
        ], 201);
    }

    /**
     * Display a specific CP bundle owned by the vendor.
     */
    public function show(CpBundle $cpBundle): JsonResponse
    {
        Gate::authorize('update', $cpBundle);

        return response()->json([
            'data' => new CpBundleResource($cpBundle),
        ]);
    }

    /**
     * Update an existing CP bundle.
     */
    public function update(UpdateCpBundleRequest $request, CpBundle $cpBundle): JsonResponse
    {
        Gate::authorize('update', $cpBundle);

        $cpBundle->update($request->validated());

        return response()->json([
            'message' => 'CP bundle updated successfully.',
            'data' => new CpBundleResource($cpBundle),
        ]);
    }

    /**
     * Soft delete a CP bundle.
     */
    public function destroy(CpBundle $cpBundle): JsonResponse
    {
        Gate::authorize('delete', $cpBundle);

        $cpBundle->delete();

        return response()->json([
            'message' => 'CP bundle removed from inventory.',
        ]);
    }
}

