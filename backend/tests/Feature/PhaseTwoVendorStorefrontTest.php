<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseTwoVendorStorefrontTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_list_published_vendors(): void
    {
        $vendor1 = User::factory()->vendor()->create();
        VendorProfile::create([
            'user_id' => $vendor1->id,
            'store_name' => 'Kilo Armory',
            'store_slug' => 'kilo-armory',
            'whatsapp_number' => '255712111111',
            'description' => 'Fast and reliable accounts.',
            'is_published' => true,
        ]);

        $vendor2 = User::factory()->vendor()->create();
        VendorProfile::create([
            'user_id' => $vendor2->id,
            'store_name' => 'Secret Stash',
            'store_slug' => 'secret-stash',
            'whatsapp_number' => '255712222222',
            'description' => 'Draft store.',
            'is_published' => false,
        ]);

        $response = $this->getJson('/api/v1/vendors');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.store_slug', 'kilo-armory');
    }

    public function test_customer_can_view_vendor_by_slug(): void
    {
        $vendor = User::factory()->vendor()->create();
        VendorProfile::create([
            'user_id' => $vendor->id,
            'store_name' => 'Echo Depot',
            'store_slug' => 'echo-depot',
            'whatsapp_number' => '255788990011',
            'description' => 'Top accounts and CP.',
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/v1/vendors/echo-depot');

        $response->assertStatus(200)
            ->assertJsonPath('data.store_name', 'Echo Depot')
            ->assertJsonPath('data.whatsapp_number', '255788990011');
    }

    public function test_vendor_can_view_own_profile(): void
    {
        $vendor = User::factory()->vendor()->create();
        VendorProfile::create([
            'user_id' => $vendor->id,
            'store_name' => 'Foxtrot Store',
            'store_slug' => 'foxtrot-store',
            'whatsapp_number' => '255755443322',
            'description' => 'Foxtrot verified.',
            'is_published' => true,
        ]);

        Sanctum::actingAs($vendor);

        $response = $this->getJson('/api/v1/vendor/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.store_name', 'Foxtrot Store');
    }

    public function test_vendor_can_update_own_profile(): void
    {
        $vendor = User::factory()->vendor()->create();
        $profile = VendorProfile::create([
            'user_id' => $vendor->id,
            'store_name' => 'Old Store Name',
            'store_slug' => 'old-store-name',
            'whatsapp_number' => '255755000000',
            'description' => 'Old description.',
            'is_published' => true,
        ]);

        Sanctum::actingAs($vendor);

        $response = $this->patchJson('/api/v1/vendor/profile', [
            'store_name' => 'New Premium Armory',
            'whatsapp_number' => '255755999999',
            'description' => 'Updated high performance inventory.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.store_name', 'New Premium Armory')
            ->assertJsonPath('data.whatsapp_number', '255755999999');

        $this->assertDatabaseHas('vendor_profiles', [
            'id' => $profile->id,
            'store_name' => 'New Premium Armory',
            'whatsapp_number' => '255755999999',
        ]);
    }

    public function test_vendor_cannot_modify_another_vendors_profile(): void
    {
        $vendorA = User::factory()->vendor()->create();
        $profileA = VendorProfile::create([
            'user_id' => $vendorA->id,
            'store_name' => 'Vendor A Store',
            'store_slug' => 'vendor-a-store',
            'whatsapp_number' => '255711111111',
            'is_published' => true,
        ]);

        $vendorB = User::factory()->vendor()->create();
        $profileB = VendorProfile::create([
            'user_id' => $vendorB->id,
            'store_name' => 'Vendor B Store',
            'store_slug' => 'vendor-b-store',
            'whatsapp_number' => '255722222222',
            'is_published' => true,
        ]);

        // Acting as Vendor B, updating profile updates Vendor B's own profile only
        Sanctum::actingAs($vendorB);

        $response = $this->patchJson('/api/v1/vendor/profile', [
            'store_name' => 'Vendor B Updated',
        ]);

        $response->assertStatus(200);

        // Vendor A's profile must remain completely unchanged
        $this->assertDatabaseHas('vendor_profiles', [
            'id' => $profileA->id,
            'store_name' => 'Vendor A Store',
        ]);
    }

    public function test_customer_cannot_update_vendor_profile(): void
    {
        $customer = User::factory()->customer()->create();
        Sanctum::actingAs($customer);

        $response = $this->patchJson('/api/v1/vendor/profile', [
            'store_name' => 'Malicious Update',
        ]);

        $response->assertStatus(403);
    }
}

