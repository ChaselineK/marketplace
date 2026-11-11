<?php

namespace App\Policies;

use App\Enums\ListingStatus;
use App\Models\AccountListing;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AccountListingPolicy
{
    /**
     * Determine whether the user can view the listing.
     */
    public function view(?User $user, AccountListing $listing): bool
    {
        if ($listing->status === ListingStatus::PUBLISHED) {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $user->isSuperAdmin() || $user->id === $listing->vendor_id;
    }

    /**
     * Determine whether the user can create listings.
     */
    public function create(User $user): bool
    {
        return $user->isVendor() && $user->is_active;
    }

    /**
     * Determine whether the user can update the listing.
     */
    public function update(User $user, AccountListing $listing): Response
    {
        if ($user->isSuperAdmin() || $user->id === $listing->vendor_id) {
            return Response::allow();
        }

        return Response::deny('You do not own this listing.');
    }

    /**
     * Determine whether the user can delete the listing.
     */
    public function delete(User $user, AccountListing $listing): Response
    {
        if ($user->isSuperAdmin() || $user->id === $listing->vendor_id) {
            return Response::allow();
        }

        return Response::deny('You do not own this listing.');
    }

    /**
     * Determine whether the user can mark the listing as sold.
     */
    public function markSold(User $user, AccountListing $listing): Response
    {
        if ($user->isSuperAdmin() || $user->id === $listing->vendor_id) {
            return Response::allow();
        }

        return Response::deny('You do not have permission to mark this listing as sold.');
    }
}

