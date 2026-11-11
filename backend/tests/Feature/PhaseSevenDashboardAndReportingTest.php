<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\User;
use App\Models\VendorProfile;
use App\Services\AuditLogService;
use App\Services\DailyReportingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseSevenDashboardAndReportingTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;
    private User $vendorA;
    private User $vendorB;
    private User $customer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->superAdmin = User::factory()->create([
            'role' => UserRole::SUPER_ADMIN,
            'is_active' => true,
        ]);

        $this->vendorA = User::factory()->create([
            'role' => UserRole::VENDOR,
            'is_active' => true,
        ]);
        VendorProfile::create([
            'user_id' => $this->vendorA->id,
            'store_name' => 'Store Alpha',
            'store_slug' => 'store-alpha',
            'whatsapp_number' => '255711111111',
            'is_published' => true,
        ]);

        $this->vendorB = User::factory()->create([
            'role' => UserRole::VENDOR,
            'is_active' => true,
        ]);
        VendorProfile::create([
            'user_id' => $this->vendorB->id,
            'store_name' => 'Store Beta',
            'store_slug' => 'store-beta',
            'whatsapp_number' => '255722222222',
            'is_published' => true,
        ]);

        $this->customer = User::factory()->create([
            'role' => UserRole::CUSTOMER,
            'is_active' => true,
        ]);
    }

    public function test_daily_sales_aggregates_completed_orders_in_dar_es_salaam_timezone(): void
    {
        $testDate = '2026-11-11';

        // Local 10:00 AM on 2026-11-11 in Africa/Dar_es_Salaam (UTC+3) is 07:00 UTC
        $completedTimeUtc = Carbon::parse('2026-11-11 10:00:00', DailyReportingService::BUSINESS_TIMEZONE)->setTimezone('UTC');

        // Completed order for Vendor A
        Order::create([
            'public_reference' => 'WS-2026-SALE01',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendorA->id,
            'item_type' => 'account',
            'item_title_snapshot' => 'Alpha Account',
            'quantity' => 1,
            'unit_price_amount' => 100000,
            'price_currency' => 'TZS',
            'total_price_amount' => 100000,
            'status' => OrderStatus::COMPLETED,
            'completed_at' => $completedTimeUtc,
        ]);

        // Completed order for Vendor B on same day
        Order::create([
            'public_reference' => 'WS-2026-SALE02',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendorB->id,
            'item_type' => 'cp_bundle',
            'item_title_snapshot' => '5,000 CP',
            'quantity' => 1,
            'unit_price_amount' => 60000,
            'price_currency' => 'TZS',
            'total_price_amount' => 60000,
            'status' => OrderStatus::COMPLETED,
            'completed_at' => $completedTimeUtc,
        ]);

        // Non-completed order (pending) should NOT be counted
        Order::create([
            'public_reference' => 'WS-2026-PEND01',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendorA->id,
            'item_type' => 'account',
            'item_title_snapshot' => 'Pending Account',
            'quantity' => 1,
            'unit_price_amount' => 80000,
            'price_currency' => 'TZS',
            'total_price_amount' => 80000,
            'status' => OrderStatus::PENDING,
        ]);

        // Vendor A dashboard only shows Vendor A's completed sales
        $responseA = $this->actingAs($this->vendorA)
            ->getJson("/api/v1/vendor/dashboard?date={$testDate}");

        $responseA->assertStatus(200)
            ->assertJsonPath('data.daily_sales.completed_orders_count', 1)
            ->assertJsonPath('data.daily_sales.total_sales_amount', 100000)
            ->assertJsonPath('data.daily_sales.timezone', 'Africa/Dar_es_Salaam')
            ->assertJsonPath('data.orders.pending', 1);

        // Vendor B dashboard only shows Vendor B's completed sales
        $responseB = $this->actingAs($this->vendorB)
            ->getJson("/api/v1/vendor/dashboard?date={$testDate}");

        $responseB->assertStatus(200)
            ->assertJsonPath('data.daily_sales.completed_orders_count', 1)
            ->assertJsonPath('data.daily_sales.total_sales_amount', 60000);

        // Super Admin dashboard aggregates all vendors (100k + 60k = 160k)
        $responseAdmin = $this->actingAs($this->superAdmin)
            ->getJson("/api/v1/admin/dashboard?date={$testDate}");

        $responseAdmin->assertStatus(200)
            ->assertJsonPath('data.daily_sales.completed_orders_count', 2)
            ->assertJsonPath('data.daily_sales.total_sales_amount', 160000)
            ->assertJsonPath('data.platform_totals.total_vendors', 2);
    }

    public function test_audit_logs_record_actions_and_strip_passwords(): void
    {
        AuditLogService::log(
            $this->superAdmin,
            'vendor.created',
            $this->vendorA,
            [
                'store_name' => 'Store Alpha',
                'password' => 'SecretPassword123!', // Sensitive field must be stripped
                'email' => 'vendor@test.com',
            ]
        );

        $this->assertDatabaseHas('audit_logs', [
            'actor_id' => $this->superAdmin->id,
            'action' => 'vendor.created',
        ]);

        $log = AuditLog::first();
        $this->assertArrayNotHasKey('password', $log->metadata);
        $this->assertEquals('Store Alpha', $log->metadata['store_name']);
        $this->assertEquals('vendor@test.com', $log->metadata['email']);

        // Admin can list audit logs
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_customer_and_vendor_cannot_access_admin_dashboard_or_audit_logs(): void
    {
        $this->actingAs($this->customer)
            ->getJson('/api/v1/admin/dashboard')
            ->assertStatus(403);

        $this->actingAs($this->customer)
            ->getJson('/api/v1/admin/audit-logs')
            ->assertStatus(403);

        $this->actingAs($this->vendorA)
            ->getJson('/api/v1/admin/dashboard')
            ->assertStatus(403);

        $this->actingAs($this->vendorA)
            ->getJson('/api/v1/admin/audit-logs')
            ->assertStatus(403);
    }
}

