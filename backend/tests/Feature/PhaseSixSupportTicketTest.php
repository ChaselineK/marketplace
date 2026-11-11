<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\User;
use App\Models\VendorProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhaseSixSupportTicketTest extends TestCase
{
    use RefreshDatabase;

    private User $customer;
    private User $otherCustomer;
    private User $vendorA;
    private User $vendorB;
    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');

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

        $this->otherCustomer = User::factory()->create([
            'role' => UserRole::CUSTOMER,
            'is_active' => true,
        ]);
    }

    public function test_customer_can_create_ticket_with_evidence_image(): void
    {
        $image = UploadedFile::fake()->image('evidence.png', 800, 600);

        $response = $this->actingAs($this->customer)
            ->post('/api/v1/tickets', [
                'vendor_id' => $this->vendorA->id,
                'subject' => 'Account password not received',
                'description' => 'I paid on WhatsApp but have not received credentials yet.',
                'attachments' => [$image],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.subject', 'Account password not received')
            ->assertJsonPath('data.status', 'open')
            ->assertJsonCount(1, 'data.attachments');

        $this->assertDatabaseHas('support_tickets', [
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendorA->id,
            'subject' => 'Account password not received',
            'status' => 'open',
        ]);

        $ticket = SupportTicket::first();
        $this->assertStringStartsWith('TK-' . date('Y') . '-', $ticket->public_reference);

        // Verify attachment stored in private storage disk, not public
        $attachment = SupportTicketAttachment::first();
        $this->assertEquals('local', $attachment->disk);
        Storage::disk('local')->assertExists($attachment->path);
    }

    public function test_disallowed_attachment_types_and_executables_are_rejected(): void
    {
        // Try uploading a disallowed text or fake exe file
        $badFile = UploadedFile::fake()->create('malicious.php', 100, 'application/x-php');

        $response = $this->actingAs($this->customer)
            ->post('/api/v1/tickets', [
                'vendor_id' => $this->vendorA->id,
                'subject' => 'Issue with account',
                'description' => 'Detailed problem description here.',
                'attachments' => [$badFile],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['attachments.0']);
    }

    public function test_ticket_creator_and_assigned_vendor_can_view_ticket(): void
    {
        $ticket = SupportTicket::create([
            'public_reference' => 'TK-2026-VIEW01',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendorA->id,
            'subject' => 'Delivery Delay',
            'description' => 'Still waiting for CP delivery confirmation.',
            'status' => TicketStatus::OPEN,
        ]);

        // Customer can view
        $this->actingAs($this->customer)
            ->getJson("/api/v1/tickets/{$ticket->public_reference}")
            ->assertStatus(200)
            ->assertJsonPath('data.public_reference', 'TK-2026-VIEW01');

        // Assigned vendor can view
        $this->actingAs($this->vendorA)
            ->getJson("/api/v1/vendor/tickets/{$ticket->public_reference}")
            ->assertStatus(200)
            ->assertJsonPath('data.public_reference', 'TK-2026-VIEW01');

        // Super Admin can view
        $this->actingAs($this->superAdmin)
            ->getJson("/api/v1/admin/tickets/{$ticket->public_reference}")
            ->assertStatus(200)
            ->assertJsonPath('data.public_reference', 'TK-2026-VIEW01');
    }

    public function test_unrelated_vendor_cannot_view_or_modify_ticket(): void
    {
        $ticket = SupportTicket::create([
            'public_reference' => 'TK-2026-ISOLAT',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendorA->id,
            'subject' => 'Vendor A Private Ticket',
            'description' => 'Private dispute between customer and Vendor A.',
            'status' => TicketStatus::OPEN,
        ]);

        // Vendor B attempts to view Vendor A's ticket -> 403 Forbidden
        $this->actingAs($this->vendorB)
            ->getJson("/api/v1/vendor/tickets/{$ticket->public_reference}")
            ->assertStatus(403);

        // Vendor B attempts to update status -> 403 Forbidden
        $this->actingAs($this->vendorB)
            ->patchJson("/api/v1/vendor/tickets/{$ticket->public_reference}", [
                'status' => 'resolved',
            ])
            ->assertStatus(403);

        // Vendor B attempts to reply -> 403 Forbidden
        $this->actingAs($this->vendorB)
            ->postJson("/api/v1/vendor/tickets/{$ticket->public_reference}/messages", [
                'message' => 'Unauthorized intrusion attempt.',
            ])
            ->assertStatus(403);
    }

    public function test_unrelated_vendor_cannot_download_private_attachment(): void
    {
        $ticket = SupportTicket::create([
            'public_reference' => 'TK-2026-ATTACH',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendorA->id,
            'subject' => 'Secret Evidence',
            'description' => 'Evidence attached.',
            'status' => TicketStatus::OPEN,
        ]);

        $filePath = 'ticket-evidence/secret.png';
        Storage::disk('local')->put($filePath, 'fake-image-binary-data');

        $attachment = SupportTicketAttachment::create([
            'ticket_id' => $ticket->id,
            'uploaded_by' => $this->customer->id,
            'disk' => 'local',
            'path' => $filePath,
            'file_name' => 'secret.png',
            'mime_type' => 'image/png',
            'size_bytes' => 24,
        ]);

        // Authorized customer can download
        $this->actingAs($this->customer)
            ->get("/api/v1/tickets/{$ticket->public_reference}/attachments/{$attachment->id}/download")
            ->assertStatus(200);

        // Authorized assigned vendor can download
        $this->actingAs($this->vendorA)
            ->get("/api/v1/tickets/{$ticket->public_reference}/attachments/{$attachment->id}/download")
            ->assertStatus(200);

        // Other vendor (Vendor B) receives 403 Forbidden
        $this->actingAs($this->vendorB)
            ->get("/api/v1/tickets/{$ticket->public_reference}/attachments/{$attachment->id}/download")
            ->assertStatus(403);

        // Other customer receives 403 Forbidden
        $this->actingAs($this->otherCustomer)
            ->get("/api/v1/tickets/{$ticket->public_reference}/attachments/{$attachment->id}/download")
            ->assertStatus(403);
    }

    public function test_participants_can_reply_and_vendor_can_update_status(): void
    {
        $ticket = SupportTicket::create([
            'public_reference' => 'TK-2026-REPLY1',
            'customer_id' => $this->customer->id,
            'vendor_id' => $this->vendorA->id,
            'subject' => 'Assistance Needed',
            'description' => 'Can you send the login code?',
            'status' => TicketStatus::OPEN,
        ]);

        // Vendor replies
        $this->actingAs($this->vendorA)
            ->postJson("/api/v1/vendor/tickets/{$ticket->public_reference}/messages", [
                'message' => 'Code sent to your WhatsApp.',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('support_ticket_messages', [
            'ticket_id' => $ticket->id,
            'user_id' => $this->vendorA->id,
            'message' => 'Code sent to your WhatsApp.',
        ]);

        // Vendor marks resolved
        $this->actingAs($this->vendorA)
            ->patchJson("/api/v1/vendor/tickets/{$ticket->public_reference}", [
                'status' => 'resolved',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved');

        $ticket->refresh();
        $this->assertEquals(TicketStatus::RESOLVED, $ticket->status);
        $this->assertNotNull($ticket->resolved_at);
    }
}

