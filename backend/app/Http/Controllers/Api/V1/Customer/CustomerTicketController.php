<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\CreateTicketRequest;
use App\Http\Requests\Tickets\StoreTicketMessageRequest;
use App\Http\Resources\SupportTicketMessageResource;
use App\Http\Resources\SupportTicketResource;
use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\SupportTicketMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerTicketController extends Controller
{
    /**
     * List authenticated customer's own tickets.
     */
    public function index(Request $request): JsonResponse
    {
        $tickets = SupportTicket::where('customer_id', $request->user()->id)
            ->with(['vendor.vendorProfile', 'order'])
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
     * Create a new support ticket with optional private evidence attachments.
     */
    public function store(CreateTicketRequest $request): JsonResponse
    {
        $user = $request->user();

        $ticket = DB::transaction(function () use ($request, $user) {
            do {
                $ref = 'TK-' . date('Y') . '-' . strtoupper(Str::random(6));
            } while (SupportTicket::where('public_reference', $ref)->exists());

            $priority = $request->input('priority')
                ? TicketPriority::from($request->input('priority'))
                : TicketPriority::NORMAL;

            $ticket = SupportTicket::create([
                'public_reference' => $ref,
                'customer_id' => $user->id,
                'vendor_id' => $request->integer('vendor_id'),
                'order_id' => $request->input('order_id'),
                'subject' => $request->validated('subject'),
                'description' => $request->validated('description'),
                'status' => TicketStatus::OPEN,
                'priority' => $priority,
            ]);

            // Handle private attachments if provided
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('ticket-evidence', $filename, 'local');

                    SupportTicketAttachment::create([
                        'ticket_id' => $ticket->id,
                        'message_id' => null,
                        'uploaded_by' => $user->id,
                        'disk' => 'local',
                        'path' => $path,
                        'file_name' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                        'size_bytes' => $file->getSize(),
                    ]);
                }
            }

            return $ticket;
        });

        $ticket->load(['customer', 'vendor.vendorProfile', 'order', 'attachments', 'messages.user']);

        return response()->json([
            'message' => 'Support ticket created successfully.',
            'data' => new SupportTicketResource($ticket),
        ], 201);
    }

    /**
     * Show a specific ticket owned by the customer.
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
     * Customer posts a reply to their ticket.
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

            // Update ticket status back to open / in_progress if customer replies
            if ($ticket->status === TicketStatus::WAITING_FOR_CUSTOMER) {
                $ticket->update(['status' => TicketStatus::IN_PROGRESS]);
            }

            return $msg;
        });

        return response()->json([
            'message' => 'Reply posted successfully.',
            'data' => new SupportTicketMessageResource($message->load('user')),
        ], 201);
    }

    /**
     * Customer closes the ticket.
     */
    public function close(Request $request, string $reference): JsonResponse
    {
        $ticket = SupportTicket::where('public_reference', $reference)->firstOrFail();

        Gate::authorize('update', $ticket);

        $ticket->update([
            'status' => TicketStatus::CLOSED,
            'closed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Ticket closed successfully.',
            'data' => new SupportTicketResource($ticket->load(['customer', 'vendor.vendorProfile', 'order'])),
        ]);
    }
}

