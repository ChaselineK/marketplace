<?php

namespace App\Http\Requests\Listings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isVendor() || $this->user()?->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string', 'max:5000'],
            'price_amount' => ['sometimes', 'required', 'numeric', 'min:1'],
            'price_currency' => ['sometimes', 'string', 'in:TZS,USD,NGN'],
            'status' => ['sometimes', 'string', 'in:draft,published,unavailable,archived'],
        ];
    }
}

