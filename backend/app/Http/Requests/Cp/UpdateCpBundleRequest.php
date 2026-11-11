<?php

namespace App\Http\Requests\Cp;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCpBundleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isVendor() || $this->user()?->isSuperAdmin();
    }

    public function rules(): array
    {
        return [
            'cp_amount' => ['sometimes', 'required', 'integer', 'min:1', 'max:100000'],
            'price_amount' => ['sometimes', 'required', 'numeric', 'min:1'],
            'price_currency' => ['sometimes', 'string', 'in:TZS,USD,NGN'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'string', 'in:draft,published,unavailable'],
        ];
    }
}

