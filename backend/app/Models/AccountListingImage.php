<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class AccountListingImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_listing_id',
        'disk',
        'path',
        'alt_text',
        'sort_order',
    ];

    protected $appends = ['url'];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(AccountListing::class, 'account_listing_id');
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk($this->disk)->url($this->path);
    }
}

