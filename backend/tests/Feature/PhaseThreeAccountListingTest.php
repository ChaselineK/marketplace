<?php

namespace Tests\Feature;

use App\Enums\ListingStatus;
use App\Models\AccountListing;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseThreeAccountListingTest extends TestCase
{
    use RefreshDatabase;

    private function createVendor(string $email = 'vendor@example.com'): User
    {
        $vendor = User::factory()->vendor()->create(['email' => $email]);
        VendorProfile::create([
            'user_id' => $vendor->id,
            'store_name' => 'Test Vendor Store',
            'store_slug' => 'test-vendor-store-' . $vendor->id,
            'whatsapp_number' => '255711000000',
            'is_published' => true,
        ]);
        return $vendor;
    }

    public function test_vendor_can_create_account_listing_with_valid_image(): void
    {
        Storage::fake('public');

        $vendor = $this->createVendor();
        Sanctum::actingAs($vendor);

        $image = UploadedFile::fake()->image('listing.png', 800, 600);

        $response = $this->postJson('/api/v1/vendor/account-listings', [
            'title' => 'Mythic Kilo 141 - Demonsong Level 150',
            'description' => 'Complete Damascus camo with 3 mythics and 12 legendaries.',
            'price_amount' => 450000,
            'price_currency' => 'TZS',
            'status' => 'published',
            'images' => [$image],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Mythic Kilo 141 - Demonsong Level 150')
            ->assertJsonPath('data.price_amount', 450000);

        $this->assertDatabaseHas('account_listings', [
            'vendor_id' => $vendor->id,
            'title' => 'Mythic Kilo 141 - Demonsong Level 150',
            'status' => ListingStatus::PUBLISHED->value,
        ]);

        $listing = AccountListing::first();
        $this->assertCount(1, $listing->images);
        Storage::disk('public')->assertExists($listing->images->first()->path);
    }

    public function test_invalid_file_types_are_rejected(): void
    {
        Storage::fake('public');

        $vendor = $this->createVendor();
        Sanctum::actingAs($vendor);

        $fakePdf = UploadedFile::fake()->create('malicious.pdf', 100, 'application/pdf');

        $response = $this->postJson('/api/v1/vendor/account-listings', [
            'title' => 'Invalid Image Test',
            'description' => 'Testing validation rejection of invalid file types.',
            'price_amount' => 100000,
            'images' => [$fakePdf],
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['images.0']);
    }

    public function test_vendor_cannot_modify_another_vendors_listing(): void
    {
        $vendor1 = $this->createVendor('v1@example.com');
        $vendor2 = $this->createVendor('v2@example.com');

        $listing1 = AccountListing::factory()->create([
            'vendor_id' => $vendor1->id,
            'title' => 'Vendor 1 Secret Account',
        ]);

        Sanctum::actingAs($vendor2);

        $response = $this->patchJson("/api/v1/vendor/account-listings/{$listing1->id}", [
            'title' => 'Hijacked Title',
        ]);

        $response->assertStatus(403);
    }

    public function test_vendor_can_mark_listing_as_sold(): void
    {
        $vendor = $this->createVendor();
        $listing = AccountListing::factory()->create([
            'vendor_id' => $vendor->id,
            'status' => ListingStatus::PUBLISHED,
            'sold_at' => null,
        ]);

        Sanctum::actingAs($vendor);

        $response = $this->postJson("/api/v1/vendor/account-listings/{$listing->id}/mark-sold");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'sold');

        $this->assertDatabaseHas('account_listings', [
            'id' => $listing->id,
            'status' => ListingStatus::SOLD->value,
        ]);

        $listing->refresh();
        $this->assertNotNull($listing->sold_at);
    }

    public function test_sold_and_draft_listings_do_not_appear_in_customer_listings(): void
    {
        $vendor = $this->createVendor();

        // Published listing
        $published = AccountListing::factory()->create([
            'vendor_id' => $vendor->id,
            'title' => 'Available Listing',
            'status' => ListingStatus::PUBLISHED,
        ]);

        // Sold listing
        $sold = AccountListing::factory()->sold()->create([
            'vendor_id' => $vendor->id,
            'title' => 'Sold Out Listing',
        ]);

        // Draft listing
        $draft = AccountListing::factory()->draft()->create([
            'vendor_id' => $vendor->id,
            'title' => 'Draft Listing',
        ]);

        $response = $this->getJson('/api/v1/listings');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.id', $published->id);
    }

    public function test_customer_cannot_view_sold_listing_detail(): void
    {
        $vendor = $this->createVendor();
        $sold = AccountListing::factory()->sold()->create([
            'vendor_id' => $vendor->id,
        ]);

        $customer = User::factory()->customer()->create();
        Sanctum::actingAs($customer);

        $response = $this->getJson("/api/v1/listings/{$sold->id}");

        $response->assertStatus(404);
    }
}

