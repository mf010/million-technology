<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClientStatement extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'our_client_id',
        'client_name',
        'client_name_ar',
        'client_position',
        'client_position_ar',
        'company_name',
        'company_name_ar',
        'statement',
        'statement_ar',
        'client_image',
        'rating',
        'is_published',
        'is_featured',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'rating'        => 'integer',
            'is_published'  => 'boolean',
            'is_featured'   => 'boolean',
            'display_order' => 'integer',
        ];
    }

    // ──────────────────────────────────────────────
    //  Relationships
    // ──────────────────────────────────────────────

    /**
     * The linked OurClient (nullable — null when client is deleted).
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(OurClient::class, 'our_client_id');
    }

    // ──────────────────────────────────────────────
    //  Scopes
    // ──────────────────────────────────────────────

    public function scopePublished($query): void
    {
        $query->where('is_published', true);
    }
}
