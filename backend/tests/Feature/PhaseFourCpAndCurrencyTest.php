<?php

namespace Tests\Feature;

use App\Models\CpBundle;
use App\Models\ExchangeRate;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseFourCpAndCurrencyTest extends TestCase
{
    use RefreshDatabase;

    private function createVendor(string $email = 'vendor@example.com'): User
    {
        $vendor = User::factory()->vendor()->create(['email' => $email]);
        VendorProfile::create([
            'user_id' => $vendor->id,
            'store_name' => 'CP Test Store',
            'store_slug' => 'cp-test-store-' . $vendor->id,
            'whatsapp_number' => '255711222333',
            'is_published' => true,
        ]);
        return $vendor;
    }

    public function test_vendor_can_create_cp_bundle(): void
    {
        $vendor = $this->createVendor();
        Sanctum::actingAs($vendor);

        $response = $this->postJson('/api/v1/vendor/cp-bundles', [
            'cp_amount' => 2400,
            'price_amount' => 65000,
            'price_currency' => 'TZS',
            'status' => 'published',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.cp_amount', 2400)
            ->assertJsonPath('data.price_amount', 65000);

        $this->assertDatabaseHas('cp_bundles', [
            'vendor_id' => $vendor->id,
            'cp_amount' => 2400,
            'price_amount' => 65000,
        ]);
    }

    public function test_vendor_cannot_modify_another_vendors_cp_bundle(): void
    {
        $vendor1 = $this->createVendor('v1@example.com');
        $vendor2 = $this->createVendor('v2@example.com');

        $bundle1 = CpBundle::create([
            'vendor_id' => $vendor1->id,
            'cp_amount' => 5000,
            'price_amount' => 130000,
            'status' => 'published',
        ]);

        Sanctum::actingAs($vendor2);

        $response = $this->patchJson("/api/v1/vendor/cp-bundles/{$bundle1->id}", [
            'price_amount' => 99999,
        ]);

        $response->assertStatus(403);
    }

    public function test_customer_can_list_published_cp_bundles(): void
    {
        $vendor = $this->createVendor();

        CpBundle::create([
            'vendor_id' => $vendor->id,
            'cp_amount' => 880,
            'price_amount' => 24000,
            'status' => 'published',
        ]);

        CpBundle::create([
            'vendor_id' => $vendor->id,
            'cp_amount' => 80,
            'price_amount' => 2500,
            'status' => 'published',
        ]);

        CpBundle::create([
            'vendor_id' => $vendor->id,
            'cp_amount' => 2400,
            'price_amount' => 65000,
            'status' => 'draft', // Draft must not appear
        ]);

        $response = $this->getJson('/api/v1/cp-bundles');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('data.0.cp_amount', 80) // Ascending order
            ->assertJsonPath('data.1.cp_amount', 880);
    }

    public function test_currency_rates_endpoint_returns_rates(): void
    {
        ExchangeRate::create([
            'base_currency' => 'TZS',
            'quote_currency' => 'USD',
            'rate' => 0.00038,
            'source' => 'Admin Managed',
        ]);

        $response = $this->getJson('/api/v1/currency-rates');

        $response->assertStatus(200)
            ->assertJsonPath('base_currency', 'TZS')
            ->assertJsonCount(1, 'rates');
    }

    public function test_super_admin_can_update_exchange_rate(): void
    {
        $admin = User::factory()->superAdmin()->create();
        Sanctum::actingAs($admin);

        $response = $this->patchJson('/api/v1/admin/exchange-rates', [
            'base_currency' => 'TZS',
            'quote_currency' => 'USD',
            'rate' => 0.00040,
            'source' => 'Central Bank',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.rate', 0.0004);

        $this->assertDatabaseHas('exchange_rates', [
            'base_currency' => 'TZS',
            'quote_currency' => 'USD',
            'rate' => 0.0004,
        ]);
    }

    public function test_customer_cannot_update_exchange_rate(): void
    {
        $customer = User::factory()->customer()->create();
        Sanctum::actingAs($customer);

        $response = $this->patchJson('/api/v1/admin/exchange-rates', [
            'base_currency' => 'TZS',
            'quote_currency' => 'USD',
            'rate' => 0.50,
        ]);

        $response->assertStatus(403);
    }

    public function test_exchange_rate_helper_converts_correctly(): void
    {
        ExchangeRate::create([
            'base_currency' => 'TZS',
            'quote_currency' => 'USD',
            'rate' => 0.00038,
            'source' => 'Admin',
        ]);

        $converted = ExchangeRate::convert(100000, 'TZS', 'USD');
        $this->assertEquals(38.00, $converted);

        $sameCurrency = ExchangeRate::convert(100000, 'TZS', 'TZS');
        $this->assertEquals(100000, $sameCurrency);

        $missingCurrency = ExchangeRate::convert(100000, 'TZS', 'EUR');
        $this->assertNull($missingCurrency);
    }
}

