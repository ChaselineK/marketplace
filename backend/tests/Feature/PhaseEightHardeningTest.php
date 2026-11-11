<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PhaseEightHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_responses_include_security_headers(): void
    {
        $response = $this->getJson('/api/v1/ping');

        $response->assertStatus(200);
        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    }

    public function test_auth_endpoints_are_rate_limited(): void
    {
        // 10 attempts allowed per minute. 11th attempt should receive 429 Too Many Requests.
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/login', [
                'email' => 'wrong@email.com',
                'password' => 'wrongpass',
            ]);
        }

        $throttledResponse = $this->postJson('/api/v1/login', [
            'email' => 'wrong@email.com',
            'password' => 'wrongpass',
        ]);

        $throttledResponse->assertStatus(429);
    }

    public function test_user_responses_never_expose_passwords_or_remember_tokens(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::CUSTOMER,
            'is_active' => true,
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/me');

        $response->assertStatus(200);
        $content = $response->getContent();

        $this->assertStringNotContainsString('password', $content);
        $this->assertStringNotContainsString('remember_token', $content);
    }
}

