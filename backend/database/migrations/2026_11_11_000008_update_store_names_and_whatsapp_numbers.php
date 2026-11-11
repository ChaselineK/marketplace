<?php

use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations to permanently update store names and phone numbers.
     */
    public function up(): void
    {
        // 1. Super Admin: Snow's Store
        $admin = User::where('email', 'admin@wilrichstore.com')->first();
        if ($admin) {
            $admin->update([
                'name' => 'Snow',
                'phone' => '+255682850544',
            ]);

            VendorProfile::updateOrCreate(
                ['user_id' => $admin->id],
                [
                    'store_name' => "Snow's Store",
                    'store_slug' => 'snows-store',
                    'whatsapp_number' => '255682850544',
                    'description' => "Exclusive executive inventory from Snow's Store. High-tier mythic and legendary CODM accounts.",
                    'is_published' => true,
                ]
            );
        }

        // 2. Vendor 1: REX CP STORE
        $v1 = User::where('email', 'vendor1@wilrichstore.com')->first();
        if ($v1) {
            $v1->update([
                'name' => 'REX CP STORE',
                'phone' => '+255740866470',
            ]);

            VendorProfile::updateOrCreate(
                ['user_id' => $v1->id],
                [
                    'store_name' => 'REX CP STORE',
                    'store_slug' => 'rex-cp-store',
                    'whatsapp_number' => '255740866470',
                    'description' => 'Official REX CP STORE. Fast CP delivery and top-rated CODM accounts.',
                    'is_published' => true,
                ]
            );
        }

        // 3. Vendor 2: 007 CP STORE
        $v2 = User::where('email', 'vendor2@wilrichstore.com')->first();
        if ($v2) {
            $v2->update([
                'name' => '007 CP STORE',
                'phone' => '+255621447537',
            ]);

            VendorProfile::updateOrCreate(
                ['user_id' => $v2->id],
                [
                    'store_name' => '007 CP STORE',
                    'store_slug' => '007-cp-store',
                    'whatsapp_number' => '255621447537',
                    'description' => 'Official 007 CP STORE. Competitive rates on CP packages and verified accounts.',
                    'is_published' => true,
                ]
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No-op or roll back names
    }
};
