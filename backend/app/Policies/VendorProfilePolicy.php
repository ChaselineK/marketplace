<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Auth\Access\Response;

class VendorProfilePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, VendorProfile $vendorProfile): bool
    {
        if ($vendorProfile->is_published) {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $user->isSuperAdmin() || $user->id === $vendorProfile->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, VendorProfile $vendorProfile): Response
    {
        if ($user->isSuperAdmin() || $user->id === $vendorProfile->user_id) {
            return Response::allow();
        }

        return Response::deny('You do not have permission to modify this vendor profile.');
    }
}

