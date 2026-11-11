<?php

namespace App\Http\Requests\Tickets;

use App\Enums\TicketPriority;
use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'vendor_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(function ($query) {
                    $query->where('role', UserRole::VENDOR->value)
                        ->where('is_active', true);
                }),
            ],
            'order_id' => [
                'nullable',
                'integer',
                Rule::exists('orders', 'id')->where(function ($query) {
                    // Customer can only link their own order
                    $query->where('customer_id', $this->user()->id);
                }),
            ],
            'subject' => ['required', 'string', 'min:3', 'max:255'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'priority' => ['nullable', 'string', Rule::enum(TicketPriority::class)],
            'attachments' => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'mimes:jpeg,png,webp',
                'max:5120', // 5MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'attachments.*.mimes' => 'Evidence attachments must be valid JPEG, PNG, or WebP images.',
            'attachments.*.max' => 'Each evidence image must not exceed 5MB in file size.',
        ];
    }
}

