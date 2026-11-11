<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PhaseZeroTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_ping_returns_ok(): void
    {
        $response = $this->getJson('/api/v1/ping');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
                'message' => 'WILRICH STORE API v1 is active',
            ]);
    }

    public function test_unauthenticated_request_to_protected_endpoint_returns_401(): void
    {
        $response = $this->getJson('/api/v1/test-protected');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_protected_endpoint(): void
    {
        $user = User::factory()->create([
            'name' => 'Wilrich Tester',
            'email' => 'tester@wilrichstore.com',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/test-protected');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'authenticated',
                'message' => 'You are authenticated with WILRICH STORE API',
                'user' => [
                    'id' => $user->id,
                    'email' => 'tester@wilrichstore.com',
                ],
            ]);
    }

    public function test_sanctum_csrf_cookie_endpoint_is_accessible(): void
    {
        $response = $this->get('/sanctum/csrf-cookie');

        $response->assertSuccessful();
    }
}

