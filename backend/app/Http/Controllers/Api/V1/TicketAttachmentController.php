<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TicketAttachmentController extends Controller
{
    /**
     * Authorize and stream/download a private ticket evidence attachment.
     */
    public function download(Request $request, string $reference, int $attachmentId)
    {
        $ticket = SupportTicket::where('public_reference', $reference)->firstOrFail();
        $attachment = SupportTicketAttachment::where('ticket_id', $ticket->id)
            ->where('id', $attachmentId)
            ->firstOrFail();

        Gate::authorize('downloadAttachment', [$ticket, $attachment]);

        if (! Storage::disk($attachment->disk)->exists($attachment->path)) {
            abort(404, 'Attachment file not found on disk.');
        }

        return Storage::disk($attachment->disk)->response(
            $attachment->path,
            $attachment->file_name,
            [
                'Content-Type' => $attachment->mime_type,
                'Content-Disposition' => 'inline; filename="' . $attachment->file_name . '"',
            ]
        );
    }
}

