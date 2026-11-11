<?php

namespace Database\Factories;

use App\Enums\ListingStatus;
use App\Models\AccountListing;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AccountListing>
 */
class AccountListingFactory extends Factory
{
    protected $model = AccountListing::class;

    public function definition(): array
    {
        return [
            'vendor_id' => User::factory()->vendor(),
            'title' => fake()->randomElement(['Mythic AK-47 + 5 Legendaries', 'Level 200 Damascas Account', 'OG Season 1 Ghost Account']),
            'description' => fake()->paragraph(),
            'price_amount' => fake()->randomElement([150000, 250000, 500000, 750000]),
            'price_currency' => 'TZS',
            'status' => ListingStatus::PUBLISHED,
            'sold_at' => null,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'status' => ListingStatus::DRAFT,
        ]);
    }

    public function sold(): static
    {
        return $this->state(fn () => [
            'status' => ListingStatus::SOLD,
            'sold_at' => now(),
        ]);
    }

    public function unavailable(): static
    {
        return $this->state(fn () => [
            'status' => ListingStatus::UNAVAILABLE,
        ]);
    }
}

