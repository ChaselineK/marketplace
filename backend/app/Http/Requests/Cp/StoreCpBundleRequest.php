<?php

namespace App\Http\Requests\Cp;

use Illuminate\Foundation\Http\FormRequest;

class StoreCpBundleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isVendor() && $this->user()?->is_active;
    }

    public function rules(): array
    {
        return [
            'cp_amount' => ['required', 'integer', 'min:1', 'max:100000'],
            'price_amount' => ['required', 'numeric', 'min:1'],
            'price_currency' => ['nullable', 'string', 'in:TZS,USD,NGN'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['nullable', 'string', 'in:draft,published,unavailable'],
        ];
    }
}

