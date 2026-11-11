<?php

namespace App\Enums;

enum TicketStatus: string
{
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case WAITING_FOR_CUSTOMER = 'waiting_for_customer';
    case RESOLVED = 'resolved';
    case CLOSED = 'closed';
}

