<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketMessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'sender' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'role' => $this->user->role instanceof \App\Enums\UserRole ? $this->user->role->value : $this->user->role,
            ],
            'message' => $this->message,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}

