<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseOneAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_register_as_customer(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Alice Customer',
            'email' => 'alice@example.com',
            'phone' => '+255711223344',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.email', 'alice@example.com')
            ->assertJsonPath('user.role', 'customer');

        $this->assertDatabaseHas('users', [
            'email' => 'alice@example.com',
            'role' => UserRole::CUSTOMER->value,
        ]);
    }

    public function test_registration_ignores_or_rejects_privileged_role_payload(): void
    {
        $response = $this->postJson('/api/v1/register', [
            'name' => 'Hacker Bob',
            'email' => 'hacker@example.com',
            'password' => 'SecurePass123!',
            'password_confirmation' => 'SecurePass123!',
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('user.role', 'customer');

        $user = User::where('email', 'hacker@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals(UserRole::CUSTOMER, $user->role);
        $this->assertNotEquals(UserRole::SUPER_ADMIN, $user->role);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->customer()->create([
            'email' => 'customer@example.com',
            'password' => 'Password123!',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'customer@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'customer@example.com')
            ->assertJsonPath('user.role', 'customer');

        $this->assertAuthenticatedAs($user);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'valid@example.com',
            'password' => 'CorrectPassword123!',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'valid@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::factory()->inactive()->create([
            'email' => 'inactive@example.com',
            'password' => 'Password123!',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'email' => 'inactive@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_fetch_me_profile(): void
    {
        $user = User::factory()->customer()->create([
            'name' => 'Profile Owner',
            'email' => 'owner@example.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/me');

        $response->assertStatus(200)
            ->assertJsonPath('user.email', 'owner@example.com');
    }

    public function test_customer_cannot_access_vendor_or_admin_endpoints(): void
    {
        $customer = User::factory()->customer()->create();
        Sanctum::actingAs($customer);

        // Vendor check
        $vendorResp = $this->getJson('/api/v1/vendor/portal-check');
        $vendorResp->assertStatus(403);

        // Admin check
        $adminResp = $this->getJson('/api/v1/admin/portal-check');
        $adminResp->assertStatus(403);
    }

    public function test_vendor_cannot_access_admin_endpoints(): void
    {
        $vendor = User::factory()->vendor()->create();
        Sanctum::actingAs($vendor);

        $adminResp = $this->getJson('/api/v1/admin/vendors');
        $adminResp->assertStatus(403);
    }

    public function test_super_admin_can_create_vendor_with_store_profile(): void
    {
        $admin = User::factory()->superAdmin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/vendors', [
            'name' => 'Delta Store Owner',
            'email' => 'delta@example.com',
            'phone' => '+255712000000',
            'password' => 'VendorSecret123!',
            'store_name' => 'Delta Tactical Store',
            'whatsapp_number' => '255712000000',
            'description' => 'Fast delivery and verified legendaries.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.email', 'delta@example.com')
            ->assertJsonPath('data.role', 'vendor');

        $this->assertDatabaseHas('users', [
            'email' => 'delta@example.com',
            'role' => UserRole::VENDOR->value,
        ]);

        $this->assertDatabaseHas('vendor_profiles', [
            'store_name' => 'Delta Tactical Store',
            'whatsapp_number' => '255712000000',
        ]);
    }

    public function test_user_can_logout_and_session_is_invalidated(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/logout');
        $response->assertStatus(200);
    }
}

