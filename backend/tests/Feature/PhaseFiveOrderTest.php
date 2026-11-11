<?php

namespace Tests\Feature;

use App\Enums\ListingStatus;
use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\AccountListing;
use App\Models\CpBundle;
use App\Models\Order;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseFiveOrderTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $vendor;
    private VendorProfile $vendorProfile;
    private User $otherCustomer;
    private User $otherVendor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->vendor = User::factory()->create([
            'role' => UserRole::VENDOR,
            'is_active' => true,
        ]);

        $this->vendorProfile = VendorProfile::create([
            'user_id' => $this->vendor->id,
            'store_name' => 'Ghost Armory',
            'store_slug' => 'ghost-armory',
            'whatsapp_number' => '255712345678',
            'description' => 'Elite CODM Vendor',
            'is_published' => true,
        ]);

        $this->customer = User::factory()->create([
            'role' => UserRole::CUSTOMER,
            'is_active' => true,
        ]);

        $this->otherCustomer = User::factory()->create([
            'role' => UserRole::CUSTOMER,
            'is_active' => true,
        ]);

        $this->otherVendor = User::factory()->create([
            'role' => UserRole::VENDOR,
            'is_active' => true,
        ]);
        VendorProfile::create([
            'user_id' => $this->otherVendor->id,
            'store_name' => 'Shadow Squad',
            'store_slug' => 'shadow-squad',
            'whatsapp_number' => '255799999999',
            'description' => 'Other vendor',
            'is_published' => true,
        ]);
    }

    public function test_customer_can_create_order_for_published_account(): void
    {
        $listing = AccountListing::create([
            'vendor_id' => $this->vendor->id,
            'title' => 'Legendary Mythic M13 Account',
            'description' => 'Stacked account with Damascus camo',
            'price_amount' => 150000,
            'price_currency' => 'TZS',
            'account_level' => 150,
            'mythic_weapons_count' => 2,
            'legendary_weapons_count' => 5,
            'status' => ListingStatus::PUBLISHED,
        ]);

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/orders', [
                'item_type' => 'account',
                'item_id' => $listing->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.item_title_snapshot', 'Legendary Mythic M13 Account')
            ->assertJsonPath('data.total_price_amount', 150000)
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('orders', [
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendor->id,
            'account_listing_id' => $listing->id,
            'status' => 'pending',
        ]);

        $order = Order::first();
        $this->assertStringStartsWith('WS-' . date('Y') . '-', $order->public_reference);
        $this->assertStringContainsString('255712345678', $order->whatsapp_handoff_url);
        $this->assertStringContainsString('WILRICH+STORE', $order->whatsapp_handoff_url);
    }

    public function test_duplicate_active_orders_for_unique_account_are_rejected(): void
    {
        $listing = AccountListing::create([
            'vendor_id' => $this->vendor->id,
            'title' => 'Single Copy Account',
            'description' => 'Only one copy exists',
            'price_amount' => 80000,
            'price_currency' => 'TZS',
            'account_level' => 100,
            'status' => ListingStatus::PUBLISHED,
        ]);

        // First customer orders it
        $this->actingAs($this->customer)
            ->postJson('/api/v1/orders', [
                'item_type' => 'account',
                'item_id' => $listing->id,
            ])
            ->assertStatus(201);

        // Second customer attempts to order the same account while pending
        $secondAttempt = $this->actingAs($this->otherCustomer)
            ->postJson('/api/v1/orders', [
                'item_type' => 'account',
                'item_id' => $listing->id,
            ]);

        $secondAttempt->assertStatus(422)
            ->assertJsonValidationErrors(['item_id']);
    }

    public function test_customer_can_order_cp_bundle_with_quantity(): void
    {
        $bundle = CpBundle::create([
            'vendor_id' => $this->vendor->id,
            'cp_amount' => 5000,
            'price_amount' => 65000,
            'price_currency' => 'TZS',
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->customer)
            ->postJson('/api/v1/orders', [
                'item_type' => 'cp_bundle',
                'item_id' => $bundle->id,
                'quantity' => 2,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.quantity', 2)
            ->assertJsonPath('data.unit_price_amount', 65000)
            ->assertJsonPath('data.total_price_amount', 130000)
            ->assertJsonPath('data.status', 'pending');
    }

    public function test_customer_cannot_view_or_cancel_another_customers_order(): void
    {
        $order = Order::create([
            'public_reference' => 'WS-2026-TEST01',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendor->id,
            'item_type' => 'account',
            'item_title_snapshot' => 'Private Account Order',
            'item_description_snapshot' => 'Private details',
            'quantity' => 1,
            'unit_price_amount' => 50000,
            'price_currency' => 'TZS',
            'total_price_amount' => 50000,
            'status' => OrderStatus::PENDING,
        ]);

        // other customer tries to view
        $this->actingAs($this->otherCustomer)
            ->getJson("/api/v1/orders/{$order->public_reference}")
            ->assertStatus(403);

        // other customer tries to cancel
        $this->actingAs($this->otherCustomer)
            ->postJson("/api/v1/orders/{$order->public_reference}/cancel")
            ->assertStatus(403);
    }

    public function test_customer_can_cancel_pending_order(): void
    {
        $order = Order::create([
            'public_reference' => 'WS-2026-CANCEL',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendor->id,
            'item_type' => 'account',
            'item_title_snapshot' => 'Account to cancel',
            'item_description_snapshot' => 'Will be cancelled',
            'quantity' => 1,
            'unit_price_amount' => 50000,
            'price_currency' => 'TZS',
            'total_price_amount' => 50000,
            'status' => OrderStatus::PENDING,
        ]);

        $this->actingAs($this->customer)
            ->postJson("/api/v1/orders/{$order->public_reference}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('orders', [
            'public_reference' => 'WS-2026-CANCEL',
            'status' => 'cancelled',
        ]);
    }

    public function test_vendor_can_transition_order_and_completion_marks_account_sold(): void
    {
        $listing = AccountListing::create([
            'vendor_id' => $this->vendor->id,
            'title' => 'Account To Be Sold',
            'description' => 'Complete handover test',
            'price_amount' => 200000,
            'price_currency' => 'TZS',
            'account_level' => 150,
            'status' => ListingStatus::PUBLISHED,
        ]);

        $order = Order::create([
            'public_reference' => 'WS-2026-FULFIL',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendor->id,
            'item_type' => 'account',
            'account_listing_id' => $listing->id,
            'item_title_snapshot' => $listing->title,
            'item_description_snapshot' => $listing->description,
            'quantity' => 1,
            'unit_price_amount' => 200000,
            'price_currency' => 'TZS',
            'total_price_amount' => 200000,
            'status' => OrderStatus::PENDING,
        ]);

        // Vendor transitions to processing
        $this->actingAs($this->vendor)
            ->patchJson("/api/v1/vendor/orders/{$order->id}/status", [
                'status' => 'processing',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'processing');

        // Vendor transitions to completed
        $this->actingAs($this->vendor)
            ->patchJson("/api/v1/vendor/orders/{$order->id}/status", [
                'status' => 'completed',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');

        // Verify account listing is now marked sold automatically
        $listing->refresh();
        $this->assertEquals(ListingStatus::SOLD, $listing->status);
        $this->assertNotNull($listing->sold_at);

        // Verification of idempotence: another complete call succeeds without error
        $this->actingAs($this->vendor)
            ->patchJson("/api/v1/vendor/orders/{$order->id}/status", [
                'status' => 'completed',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_customer_can_mark_whatsapp_opened(): void
    {
        $order = Order::create([
            'public_reference' => 'WS-2026-WAOPEN',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendor->id,
            'item_type' => 'account',
            'item_title_snapshot' => 'WA Test',
            'item_description_snapshot' => 'Desc',
            'quantity' => 1,
            'unit_price_amount' => 10000,
            'price_currency' => 'TZS',
            'total_price_amount' => 10000,
            'status' => OrderStatus::PENDING,
        ]);

        $this->actingAs($this->customer)
            ->postJson("/api/v1/orders/{$order->public_reference}/whatsapp-opened")
            ->assertStatus(200)
            ->assertJsonPath('message', 'WhatsApp handoff recorded.');

        $order->refresh();
        $this->assertNotNull($order->whatsapp_opened_at);
    }
}
