<?php

namespace Database\Seeders;

use App\Enums\ListingStatus;
use App\Enums\UserRole;
use App\Models\AccountListing;
use App\Models\CpBundle;
use App\Models\ExchangeRate;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Super Admin: Snow's Store (Sells Accounts Only)
        $admin = User::updateOrCreate(
            ['email' => 'admin@wilrichstore.com'],
            [
                'name' => 'Snow',
                'phone' => '+255682850544',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::SUPER_ADMIN,
                'is_active' => true,
            ]
        );
        VendorProfile::updateOrCreate(
            ['user_id' => $admin->id],
            [
                'store_name' => "Snow's Store",
                'store_slug' => 'snows-store',
                'whatsapp_number' => '255682850544',
                'description' => "Exclusive executive inventory from Snow's Store. High-tier mythic and legendary CODM accounts.",
                'is_published' => true,
            ]
        );

        // 2. Vendor 1: REX CP STORE
        $vendor1 = User::updateOrCreate(
            ['email' => 'vendor1@wilrichstore.com'],
            [
                'name' => 'REX CP STORE',
                'phone' => '+255740866470',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::VENDOR,
                'is_active' => true,
            ]
        );
        VendorProfile::updateOrCreate(
            ['user_id' => $vendor1->id],
            [
                'store_name' => 'REX CP STORE',
                'store_slug' => 'rex-cp-store',
                'whatsapp_number' => '255740866470',
                'description' => 'Official REX CP STORE. Fast CP delivery and top-rated CODM accounts.',
                'is_published' => true,
            ]
        );

        // 3. Vendor 2: 007 CP STORE
        $vendor2 = User::updateOrCreate(
            ['email' => 'vendor2@wilrichstore.com'],
            [
                'name' => '007 CP STORE',
                'phone' => '+255621447537',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::VENDOR,
                'is_active' => true,
            ]
        );
        VendorProfile::updateOrCreate(
            ['user_id' => $vendor2->id],
            [
                'store_name' => '007 CP STORE',
                'store_slug' => '007-cp-store',
                'whatsapp_number' => '255621447537',
                'description' => 'Official 007 CP STORE. Competitive rates on CP packages and verified accounts.',
                'is_published' => true,
            ]
        );

        // 4. Sample Customer
        User::firstOrCreate(
            ['email' => 'customer@wilrichstore.com'],
            [
                'name' => 'John Customer',
                'phone' => '+255755123456',
                'password' => Hash::make('Password123!'),
                'role' => UserRole::CUSTOMER,
                'is_active' => true,
            ]
        );

        // 5. Sample Account Listings
        AccountListing::firstOrCreate(
            ['title' => 'Mythic AK-47 Radiance + Level 150 Master'],
            [
                'vendor_id' => $vendor1->id,
                'description' => 'Features max-level Mythic AK-47 Radiance, 6 Legendary operator skins, 40+ epic weapon blueprints, and Damascus camo unlocked on assault rifles. Clean Activision login with zero bans or strikes.',
                'price_amount' => 350000,
                'price_currency' => 'TZS',
                'status' => ListingStatus::PUBLISHED,
            ]
        );

        AccountListing::firstOrCreate(
            ['title' => 'Mythic Kilo 141 Demonsong + Full Damascus'],
            [
                'vendor_id' => $vendor1->id,
                'description' => 'Fully upgraded Mythic Kilo 141 Demonsong with all mythic attachments and death effects. Full Damascus camo unlocked across all weapon classes. Includes 12 Legendary skins.',
                'price_amount' => 550000,
                'price_currency' => 'TZS',
                'status' => ListingStatus::PUBLISHED,
            ]
        );

        AccountListing::firstOrCreate(
            ['title' => 'OG Season 1 Ghost + 8 Legendary Blueprints'],
            [
                'vendor_id' => $vendor2->id,
                'description' => 'Extremely rare original 2019 Season 1 Ghost character skin with 8 Legendary blueprints including DL Q33 Holidays and AK-47 Wrath Black & Gold. Clean transfer guaranteed.',
                'price_amount' => 420000,
                'price_currency' => 'TZS',
                'status' => ListingStatus::PUBLISHED,
            ]
        );

        AccountListing::firstOrCreate(
            ['title' => 'Legendary M4 Court Jester + Mythic Switchblade'],
            [
                'vendor_id' => $vendor2->id,
                'description' => 'Competitive ranked-ready account. Features Mythic Switchblade X9 Neon Legend and Legendary M4 Court Jester. High KD ratio in Global server.',
                'price_amount' => 280000,
                'price_currency' => 'TZS',
                'status' => ListingStatus::PUBLISHED,
            ]
        );

        // Super Admin Account Listings (Super Admin sells accounts only)
        AccountListing::firstOrCreate(
            ['title' => 'Mythic Krig 6 Ice Drake + Full Mythic Spectre Operator'],
            [
                'vendor_id' => $admin->id,
                'description' => 'Exclusive official executive store listing. Features max-upgraded Mythic Krig 6 Ice Drake with custom death effect, full Mythic Spectre operator with color customizations unlocked, and 18 Legendary blueprints. Clean Activision transfer with warranty.',
                'price_amount' => 750000,
                'price_currency' => 'TZS',
                'status' => ListingStatus::PUBLISHED,
            ]
        );

        AccountListing::firstOrCreate(
            ['title' => 'Mythic DL Q33 Lotus Flames + 14 Legendaries Master Account'],
            [
                'vendor_id' => $admin->id,
                'description' => "Direct from Snow's Store. Max-level Mythic DL Q33 Lotus Flames, Damascus sniper mastery, Legendary Ghost character, and 14 Legendary blueprints. Safe Activision handoff guaranteed.",
                'price_amount' => 680000,
                'price_currency' => 'TZS',
                'status' => ListingStatus::PUBLISHED,
            ]
        );

        // 6. Exchange Rates
        ExchangeRate::updateOrCreate(
            ['base_currency' => 'TZS', 'quote_currency' => 'USD'],
            ['rate' => 0.00038, 'source' => 'Admin Managed', 'effective_at' => now()]
        );
        ExchangeRate::updateOrCreate(
            ['base_currency' => 'TZS', 'quote_currency' => 'NGN'],
            ['rate' => 0.58, 'source' => 'Admin Managed', 'effective_at' => now()]
        );

        // 7. CP Bundles for Vendor 1 (REX CP STORE)
        $v1Bundles = [
            ['cp' => 80, 'price' => 2500, 'desc' => 'Direct Activision UID top-up from REX CP STORE. Fast delivery guarantee.'],
            ['cp' => 420, 'price' => 12000, 'desc' => 'Instant battle pass unlock package from REX CP STORE. Dispatched within 5 minutes over WhatsApp.'],
            ['cp' => 880, 'price' => 24000, 'desc' => 'Battle pass plus crate tier progression. Fast delivery guarantee.'],
            ['cp' => 2400, 'price' => 65000, 'desc' => 'Popular mythic draw package. Direct UID top-up with receipt confirmation.'],
            ['cp' => 5000, 'price' => 130000, 'desc' => 'High-tier lucky draw pack with bonus CP calculation included.'],
            ['cp' => 10800, 'price' => 270000, 'desc' => 'Maximum value mega vault pack for complete mythic weapon draws.'],
        ];
        foreach ($v1Bundles as $b) {
            CpBundle::updateOrCreate(
                ['vendor_id' => $vendor1->id, 'cp_amount' => $b['cp']],
                ['price_amount' => $b['price'], 'price_currency' => 'TZS', 'description' => $b['desc'], 'status' => 'published']
            );
        }

        // 8. CP Bundles for Vendor 2 (007 CP STORE)
        $v2Bundles = [
            ['cp' => 80, 'price' => 2400, 'desc' => '007 CP STORE discount starter CP. Global server instant credit.'],
            ['cp' => 420, 'price' => 11800, 'desc' => 'Premium Pass activation pack. Zero login credentials required - UID only.'],
            ['cp' => 880, 'price' => 23500, 'desc' => 'Mid-tier bundle for draw spins and crate milestones.'],
            ['cp' => 2400, 'price' => 64000, 'desc' => 'Competitive rate mythic package from 007 CP STORE. Verified Activision authorized handoff.'],
            ['cp' => 5000, 'price' => 128000, 'desc' => 'High-roller bundle for legendary operators and vehicle skins.'],
            ['cp' => 10800, 'price' => 265000, 'desc' => 'Best value in East Africa from 007 CP STORE. Full mythic weapon max out package.'],
        ];
        foreach ($v2Bundles as $b) {
            CpBundle::updateOrCreate(
                ['vendor_id' => $vendor2->id, 'cp_amount' => $b['cp']],
                ['price_amount' => $b['price'], 'price_currency' => 'TZS', 'description' => $b['desc'], 'status' => 'published']
            );
        }

        // 9. Sample Orders & Reporting Data
        $customer = User::where('email', 'customer@wilrichstore.com')->first();
        if ($customer) {
            \App\Models\Order::firstOrCreate(
                ['public_reference' => 'WS-2026-000001'],
                [
                    'customer_id' => $customer->id,
                    'vendor_id' => $vendor1->id,
                    'item_type' => 'cp_bundle',
                    'item_title_snapshot' => '5,000 CP Top-up',
                    'item_description_snapshot' => 'In-game points delivery to Activision UID',
                    'quantity' => 1,
                    'unit_price_amount' => 130000,
                    'price_currency' => 'TZS',
                    'total_price_amount' => 130000,
                    'status' => \App\Enums\OrderStatus::COMPLETED,
                    'completed_at' => now(),
                    'whatsapp_opened_at' => now()->subMinutes(15),
                ]
            );

            \App\Models\Order::firstOrCreate(
                ['public_reference' => 'WS-2026-000002'],
                [
                    'customer_id' => $customer->id,
                    'vendor_id' => $vendor1->id,
                    'item_type' => 'cp_bundle',
                    'item_title_snapshot' => '2,400 CP Bundle',
                    'item_description_snapshot' => 'Fast CP delivery',
                    'quantity' => 1,
                    'unit_price_amount' => 65000,
                    'price_currency' => 'TZS',
                    'total_price_amount' => 65000,
                    'status' => \App\Enums\OrderStatus::PENDING,
                    'whatsapp_opened_at' => now()->subMinutes(5),
                ]
            );

            \App\Models\Order::firstOrCreate(
                ['public_reference' => 'WS-2026-000003'],
                [
                    'customer_id' => $customer->id,
                    'vendor_id' => $vendor2->id,
                    'item_type' => 'cp_bundle',
                    'item_title_snapshot' => '10,800 CP Bulk Pack',
                    'item_description_snapshot' => 'Verified bulk delivery',
                    'quantity' => 1,
                    'unit_price_amount' => 265000,
                    'price_currency' => 'TZS',
                    'total_price_amount' => 265000,
                    'status' => \App\Enums\OrderStatus::COMPLETED,
                    'completed_at' => now(),
                    'whatsapp_opened_at' => now()->subMinutes(30),
                ]
            );

            // 10. Sample Support Ticket
            $ticket = \App\Models\SupportTicket::firstOrCreate(
                ['public_reference' => 'TK-2026-000001'],
                [
                    'customer_id' => $customer->id,
                    'vendor_id' => $vendor1->id,
                    'subject' => 'WhatsApp delivery confirmation for order WS-2026-000002',
                    'description' => 'Hello Alpha CODM Store, I placed order WS-2026-000002 and sent you a WhatsApp message with my player UID. Awaiting confirmation.',
                    'status' => \App\Enums\TicketStatus::OPEN,
                    'priority' => \App\Enums\TicketPriority::NORMAL,
                ]
            );

            \App\Models\SupportTicketMessage::firstOrCreate(
                [
                    'ticket_id' => $ticket->id,
                    'message' => 'Hello Alpha CODM Store, I placed order WS-2026-000002 and sent you a WhatsApp message with my player UID. Awaiting confirmation.',
                ],
                [
                    'user_id' => $customer->id,
                ]
            );

            // 11. Initial Audit Logs
            $admin = User::where('email', 'admin@wilrichstore.com')->first();
            \App\Services\AuditLogService::log(
                $admin,
                'platform.initialized',
                $admin,
                ['event' => 'Initial platform bootstrap and exchange rates set.']
            );
        }
    }
}
