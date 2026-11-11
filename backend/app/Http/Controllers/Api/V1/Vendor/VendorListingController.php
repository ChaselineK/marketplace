<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Enums\ListingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Listings\StoreAccountListingRequest;
use App\Http\Requests\Listings\UpdateAccountListingRequest;
use App\Http\Requests\Listings\UploadListingImageRequest;
use App\Http\Resources\AccountListingResource;
use App\Models\AccountListing;
use App\Models\AccountListingImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VendorListingController extends Controller
{
    /**
     * List all account listings belonging to the authenticated vendor.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AccountListing::where('vendor_id', $request->user()->id)
            ->with(['images', 'primaryImage'])
            ->latest();

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $listings = $query->paginate($request->integer('per_page', 15));

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
     * Store a newly created account listing.
     */
    public function store(StoreAccountListingRequest $request): JsonResponse
    {
        $listing = DB::transaction(function () use ($request) {
            $listing = AccountListing::create([
                'vendor_id' => $request->user()->id,
                'title' => $request->validated('title'),
                'description' => $request->validated('description'),
                'price_amount' => $request->validated('price_amount'),
                'price_currency' => $request->validated('price_currency', 'TZS'),
                'status' => $request->validated('status', ListingStatus::PUBLISHED->value),
            ]);

            // Handle image uploads
            if ($request->hasFile('images')) {
                $sortOrder = 0;
                foreach ($request->file('images') as $imageFile) {
                    $ext = $imageFile->getClientOriginalExtension();
                    $filename = Str::uuid() . '.' . $ext;
                    $path = $imageFile->storeAs('listings', $filename, 'public');

                    AccountListingImage::create([
                        'account_listing_id' => $listing->id,
                        'disk' => 'public',
                        'path' => $path,
                        'sort_order' => $sortOrder++,
                    ]);
                }
            }

            return $listing->load(['images', 'vendor.vendorProfile']);
        });

        return response()->json([
            'message' => 'Account listing created successfully.',
            'data' => new AccountListingResource($listing),
        ], 201);
    }

    /**
     * Display a specific listing owned by the vendor.
     */
    public function show(AccountListing $accountListing): JsonResponse
    {
        Gate::authorize('update', $accountListing);

        $accountListing->load(['images', 'vendor.vendorProfile']);

        return response()->json([
            'data' => new AccountListingResource($accountListing),
        ]);
    }

    /**
     * Update an existing account listing.
     */
    public function update(UpdateAccountListingRequest $request, AccountListing $accountListing): JsonResponse
    {
        Gate::authorize('update', $accountListing);

        $accountListing->update($request->validated());
        $accountListing->load(['images', 'vendor.vendorProfile']);

        return response()->json([
            'message' => 'Listing updated successfully.',
            'data' => new AccountListingResource($accountListing),
        ]);
    }

    /**
     * Soft delete an account listing.
     */
    public function destroy(AccountListing $accountListing): JsonResponse
    {
        Gate::authorize('delete', $accountListing);

        $accountListing->delete();

        return response()->json([
            'message' => 'Listing removed from inventory.',
        ]);
    }

    /**
     * Mark an account listing as sold.
     */
    public function markSold(AccountListing $accountListing): JsonResponse
    {
        Gate::authorize('markSold', $accountListing);

        if ($accountListing->status === ListingStatus::SOLD) {
            return response()->json([
                'message' => 'Listing is already marked as sold.',
                'data' => new AccountListingResource($accountListing),
            ]);
        }

        $accountListing->markAsSold();

        return response()->json([
            'message' => 'Account marked as sold and removed from customer browse.',
            'data' => new AccountListingResource($accountListing),
        ]);
    }

    /**
     * Upload an image to an existing listing.
     */
    public function uploadImage(UploadListingImageRequest $request, AccountListing $accountListing): JsonResponse
    {
        Gate::authorize('update', $accountListing);

        $imageFile = $request->file('image');
        $ext = $imageFile->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $ext;
        $path = $imageFile->storeAs('listings', $filename, 'public');

        $maxSort = $accountListing->images()->max('sort_order') ?? -1;

        $image = AccountListingImage::create([
            'account_listing_id' => $accountListing->id,
            'disk' => 'public',
            'path' => $path,
            'alt_text' => $request->validated('alt_text'),
            'sort_order' => $maxSort + 1,
        ]);

        return response()->json([
            'message' => 'Image uploaded successfully.',
            'data' => [
                'id' => $image->id,
                'url' => $image->url,
                'alt_text' => $image->alt_text,
                'sort_order' => $image->sort_order,
            ],
        ], 201);
    }

    /**
     * Remove an image from a listing.
     */
    public function deleteImage(AccountListing $accountListing, AccountListingImage $image): JsonResponse
    {
        Gate::authorize('update', $accountListing);

        if ($image->account_listing_id !== $accountListing->id) {
            return response()->json(['message' => 'Image does not belong to this listing.'], 404);
        }

        Storage::disk($image->disk)->delete($image->path);
        $image->delete();

        return response()->json([
            'message' => 'Image deleted successfully.',
        ]);
    }
}

