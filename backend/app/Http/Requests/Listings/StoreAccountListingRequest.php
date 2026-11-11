<?php

namespace App\Http\Requests\Listings;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isVendor() && $this->user()?->is_active;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'price_amount' => ['required', 'numeric', 'min:1'],
            'price_currency' => ['nullable', 'string', 'in:TZS,USD,NGN'],
            'status' => ['nullable', 'string', 'in:draft,published'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => [
                'file',
                'image',
                'mimes:jpeg,png,webp',
                'max:5120', // 5MB
                'dimensions:max_width=4000,max_height=4000',
            ],
        ];
    }
}

