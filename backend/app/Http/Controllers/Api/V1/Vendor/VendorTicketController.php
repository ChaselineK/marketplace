<?php

namespace App\Http\Controllers\Api\V1\Vendor;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\StoreTicketMessageRequest;
use App\Http\Requests\Tickets\UpdateTicketStatusRequest;
use App\Http\Resources\SupportTicketMessageResource;
use App\Http\Resources\SupportTicketResource;
use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicketMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class VendorTicketController extends Controller
{
    /**
     * List support tickets assigned to the authenticated vendor.
     */
    public function index(Request $request): JsonResponse
    {
        $tickets = SupportTicket::where('vendor_id', $request->user()->id)
            ->with(['customer', 'order'])
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => SupportTicketResource::collection($tickets),
            'meta' => [
                'current_page' => $tickets->currentPage(),
                'last_page' => $tickets->lastPage(),
                'per_page' => $tickets->perPage(),
                'total' => $tickets->total(),
            ],
        ]);
    }

    /**
     * Display a specific support ticket assigned to this vendor.
     */
    public function show(Request $request, string $reference): JsonResponse
    {
        $ticket = SupportTicket::where('public_reference', $reference)
            ->with(['customer', 'vendor.vendorProfile', 'order', 'attachments', 'messages.user'])
            ->firstOrFail();

        Gate::authorize('view', $ticket);

        return response()->json([
            'data' => new SupportTicketResource($ticket),
        ]);
    }

    /**
     * Update ticket status / priority by the assigned vendor.
     */
    public function update(UpdateTicketStatusRequest $request, string $reference): JsonResponse
    {
        $ticket = SupportTicket::where('public_reference', $reference)->firstOrFail();

        Gate::authorize('update', $ticket);

        $targetStatus = TicketStatus::from($request->validated('status'));
        $updates = ['status' => $targetStatus];

        if ($targetStatus === TicketStatus::RESOLVED && ! $ticket->resolved_at) {
            $updates['resolved_at'] = now();
        } elseif ($targetStatus === TicketStatus::CLOSED && ! $ticket->closed_at) {
            $updates['closed_at'] = now();
        }

        if ($request->has('priority') && $request->validated('priority')) {
            $updates['priority'] = TicketPriority::from($request->validated('priority'));
        }

        $ticket->update($updates);

        return response()->json([
            'message' => 'Ticket status updated successfully.',
            'data' => new SupportTicketResource($ticket->load(['customer', 'vendor.vendorProfile', 'order', 'attachments', 'messages.user'])),
        ]);
    }

    /**
     * Vendor posts a reply to the ticket.
     */
    public function reply(StoreTicketMessageRequest $request, string $reference): JsonResponse
    {
        $ticket = SupportTicket::where('public_reference', $reference)->firstOrFail();

        Gate::authorize('reply', $ticket);

        $message = DB::transaction(function () use ($request, $ticket) {
            $msg = SupportTicketMessage::create([
                'ticket_id' => $ticket->id,
                'user_id' => $request->user()->id,
                'message' => $request->validated('message'),
            ]);

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('ticket-evidence', $filename, 'local');

                    SupportTicketAttachment::create([
                        'ticket_id' => $ticket->id,
                        'message_id' => $msg->id,
                        'uploaded_by' => $request->user()->id,
                        'disk' => 'local',
                        'path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                        'size_bytes' => $file->getSize(),
                    ]);
                }
            }

            // If vendor replies, optionally set status to waiting_for_customer
            if ($ticket->status === TicketStatus::OPEN || $ticket->status === TicketStatus::IN_PROGRESS) {
                $ticket->update(['status' => TicketStatus::WAITING_FOR_CUSTOMER]);
            }

            return $msg;
        });

        return response()->json([
            'message' => 'Vendor reply posted successfully.',
            'data' => new SupportTicketMessageResource($message->load('user')),
        ], 201);
    }
}

