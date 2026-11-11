<?php

namespace App\Policies;

use App\Models\CpBundle;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CpBundlePolicy
{
    /**
     * Determine whether the user can view the CP bundle.
     */
    public function view(?User $user, CpBundle $bundle): bool
    {
        if ($bundle->status === 'published') {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $user->isSuperAdmin() || $user->id === $bundle->vendor_id;
    }

    /**
     * Determine whether the user can create CP bundles.
     */
    public function create(User $user): bool
    {
        return $user->isVendor() && $user->is_active;
    }

    /**
     * Determine whether the user can update the CP bundle.
     */
    public function update(User $user, CpBundle $bundle): Response
    {
        if ($user->isSuperAdmin() || $user->id === $bundle->vendor_id) {
            return Response::allow();
        }

        return Response::deny('You do not own this CP bundle.');
    }

    /**
     * Determine whether the user can delete the CP bundle.
     */
    public function delete(User $user, CpBundle $bundle): Response
    {
        if ($user->isSuperAdmin() || $user->id === $bundle->vendor_id) {
            return Response::allow();
        }

        return Response::deny('You do not own this CP bundle.');
    }
}

