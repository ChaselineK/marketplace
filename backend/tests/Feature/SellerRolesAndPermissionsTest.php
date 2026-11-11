<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SellerRolesAndPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected User $superAdmin;
    protected User $vendor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN,
            'is_active' => true,
        ]);
        VendorProfile::create([
            'user_id' => $this->superAdmin->id,
            'store_name' => 'WILRICH STORE Official',
            'store_slug' => 'wilrich-official',
            'whatsapp_number' => '255700000001',
            'is_published' => true,
        ]);

        $this->vendor = User::factory()->create([
            'role' => UserRole::VENDOR,
            'is_active' => true,
        ]);
        VendorProfile::create([
            'user_id' => $this->vendor->id,
            'store_name' => 'Alpha CODM Store',
            'store_slug' => 'alpha-codm-store',
            'whatsapp_number' => '255712345678',
            'is_published' => true,
        ]);
    }

    public function test_super_admin_can_create_account_listing_with_images(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->superAdmin);

        $image = UploadedFile::fake()->image('account_preview.jpg', 800, 600);

        $response = $this->postJson('/api/v1/vendor/account-listings', [
            'title' => 'Executive Mythic Account',
            'description' => 'Official store listing with mythic weapons.',
            'price_amount' => 500000,
            'price_currency' => 'TZS',
            'status' => 'published',
            'images' => [$image],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('account_listings', [
            'vendor_id' => $this->superAdmin->id,
            'title' => 'Executive Mythic Account',
        ]);
    }

    public function test_super_admin_cannot_create_cp_bundles(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->postJson('/api/v1/vendor/cp-bundles', [
            'cp_amount' => 2400,
            'price_amount' => 60000,
            'price_currency' => 'TZS',
            'description' => 'Should be denied',
        ]);

        $response->assertForbidden();
    }

    public function test_super_admin_cannot_list_vendor_cp_bundles_endpoint(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/vendor/cp-bundles');

        $response->assertForbidden();
    }

    public function test_vendor_can_create_cp_bundle_with_price_and_description(): void
    {
        Sanctum::actingAs($this->vendor);

        $response = $this->postJson('/api/v1/vendor/cp-bundles', [
            'cp_amount' => 5000,
            'price_amount' => 125000,
            'price_currency' => 'TZS',
            'description' => 'Fast UID delivery with bonus points included.',
            'status' => 'published',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.description', 'Fast UID delivery with bonus points included.');
        $this->assertDatabaseHas('cp_bundles', [
            'vendor_id' => $this->vendor->id,
            'cp_amount' => 5000,
            'description' => 'Fast UID delivery with bonus points included.',
        ]);
    }

    public function test_vendor_can_create_account_listing_with_images(): void
    {
        Storage::fake('public');
        Sanctum::actingAs($this->vendor);

        $image = UploadedFile::fake()->image('vendor_account.png', 1024, 768);

        $response = $this->postJson('/api/v1/vendor/account-listings', [
            'title' => 'Vendor Damascus Account',
            'description' => 'Clean Damascus camo unlocked on all weapons.',
            'price_amount' => 350000,
            'price_currency' => 'TZS',
            'status' => 'published',
            'images' => [$image],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('account_listings', [
            'vendor_id' => $this->vendor->id,
            'title' => 'Vendor Damascus Account',
        ]);
    }
}
