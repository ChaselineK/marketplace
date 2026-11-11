<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExchangeRateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'base_currency' => ['required', 'string', 'in:TZS'],
            'quote_currency' => ['required', 'string', 'in:USD,NGN'],
            'rate' => ['required', 'numeric', 'gt:0'],
            'source' => ['nullable', 'string', 'max:255'],
        ];
    }
}

