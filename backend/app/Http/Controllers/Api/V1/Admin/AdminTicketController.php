<?php

namespace App\Http\Controllers\Api\V1\Admin;

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
use Illuminate\Support\Str;

class AdminTicketController extends Controller
{
    /**
     * List all platform tickets across all vendors.
     */
    public function index(Request $request): JsonResponse
    {
        $query = SupportTicket::with(['customer', 'vendor.vendorProfile', 'order'])
            ->latest();

        if ($request->filled('vendor_id')) {
            $query->where('vendor_id', $request->integer('vendor_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $tickets = $query->paginate($request->integer('per_page', 20));

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
     * Display any support ticket.
     */
    public function show(string $reference): JsonResponse
    {
        $ticket = SupportTicket::where('public_reference', $reference)
            ->with(['customer', 'vendor.vendorProfile', 'order', 'attachments', 'messages.user'])
            ->firstOrFail();

        return response()->json([
            'data' => new SupportTicketResource($ticket),
        ]);
    }

    /**
     * Super Admin updates ticket status / priority.
     */
    public function update(UpdateTicketStatusRequest $request, string $reference): JsonResponse
    {
        $ticket = SupportTicket::where('public_reference', $reference)->firstOrFail();

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
            'message' => 'Admin updated ticket successfully.',
            'data' => new SupportTicketResource($ticket->load(['customer', 'vendor.vendorProfile', 'order', 'attachments', 'messages.user'])),
        ]);
    }

    /**
     * Super Admin posts a message.
     */
    public function reply(StoreTicketMessageRequest $request, string $reference): JsonResponse
    {
        $ticket = SupportTicket::where('public_reference', $reference)->firstOrFail();

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

            return $msg;
        });

        return response()->json([
            'message' => 'Admin response posted.',
            'data' => new SupportTicketMessageResource($message->load('user')),
        ], 201);
    }
}

