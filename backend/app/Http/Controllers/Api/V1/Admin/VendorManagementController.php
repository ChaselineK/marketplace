<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateVendorRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class VendorManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $vendors = User::where('role', UserRole::VENDOR)
            ->with('vendorProfile')
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => UserResource::collection($vendors),
            'meta' => [
                'current_page' => $vendors->currentPage(),
                'last_page' => $vendors->lastPage(),
                'total' => $vendors->total(),
            ],
        ]);
    }

    public function store(CreateVendorRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'phone' => $request->validated('phone'),
                'password' => Hash::make($request->validated('password')),
                'role' => UserRole::VENDOR,
                'is_active' => true,
            ]);

            $slugBase = $request->validated('store_slug') ?: Str::slug($request->validated('store_name'));
            $slug = $slugBase;
            $counter = 1;
            while (VendorProfile::where('store_slug', $slug)->exists()) {
                $slug = "{$slugBase}-{$counter}";
                $counter++;
            }

            VendorProfile::create([
                'user_id' => $user->id,
                'store_slug' => $slug,
                'store_name' => $request->validated('store_name'),
                'whatsapp_number' => $request->validated('whatsapp_number'),
                'description' => $request->validated('description'),
                'is_published' => $request->validated('is_published', true),
            ]);

            $user->load('vendorProfile');
            return $user;
        });

        return response()->json([
            'message' => 'Vendor account created successfully.',
            'data' => new UserResource($user),
        ], 201);
    }

    public function show(User $vendor): JsonResponse
    {
        if (! $vendor->isVendor()) {
            return response()->json(['message' => 'User is not a vendor.'], 404);
        }

        $vendor->load('vendorProfile');

        return response()->json([
            'data' => new UserResource($vendor),
        ]);
    }

    public function toggleStatus(User $vendor): JsonResponse
    {
        if (! $vendor->isVendor()) {
            return response()->json(['message' => 'User is not a vendor.'], 404);
        }

        $vendor->update([
            'is_active' => ! $vendor->is_active,
        ]);

        return response()->json([
            'message' => $vendor->is_active ? 'Vendor activated.' : 'Vendor suspended.',
            'data' => new UserResource($vendor),
        ]);
    }
}

