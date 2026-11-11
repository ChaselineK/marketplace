<?php

namespace App\Http\Requests\Vendor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVendorProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isVendor() || $this->user()?->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'store_name' => ['sometimes', 'required', 'string', 'max:255'],
            'whatsapp_number' => ['sometimes', 'required', 'string', 'regex:/^[0-9]{8,15}$/'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_published' => ['sometimes', 'boolean'],
        ];
    }
}

