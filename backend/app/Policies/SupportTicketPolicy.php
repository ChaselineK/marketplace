<?php

namespace App\Policies;

use App\Models\SupportTicket;
use App\Models\SupportTicketAttachment;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SupportTicketPolicy
{
    /**
     * Determine whether the user can view the ticket.
     */
    public function view(User $user, SupportTicket $ticket): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->id === $ticket->customer_id || $user->id === $ticket->vendor_id;
    }

    /**
     * Determine whether the user can update the ticket (status, priority).
     */
    public function update(User $user, SupportTicket $ticket): Response
    {
        if ($user->isSuperAdmin()) {
            return Response::allow();
        }

        if ($user->id === $ticket->vendor_id) {
            return Response::allow();
        }

        if ($user->id === $ticket->customer_id) {
            return Response::allow();
        }

        return Response::deny('You are not authorized to update this support ticket.');
    }

    /**
     * Determine whether the user can post messages to the ticket.
     */
    public function reply(User $user, SupportTicket $ticket): Response
    {
        if ($user->isSuperAdmin() || $user->id === $ticket->customer_id || $user->id === $ticket->vendor_id) {
            return Response::allow();
        }

        return Response::deny('Only ticket participants can post messages.');
    }

    /**
     * Determine whether the user can download or stream an attachment.
     */
    public function downloadAttachment(User $user, SupportTicket $ticket, SupportTicketAttachment $attachment): Response
    {
        if ($this->view($user, $ticket)) {
            return Response::allow();
        }

        return Response::deny('You are not authorized to access this private ticket attachment.');
    }
}

