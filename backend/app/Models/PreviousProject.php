<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PreviousProject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'our_client_id',
        'title',
        'title_ar',
        'slug',
        'client_display_name',
        'client_display_name_ar',
        'short_description',
        'short_description_ar',
        'description',
        'description_ar',
        'description_image',
        'challenge',
        'challenge_ar',
        'challenge_image',
        'solution',
        'solution_ar',
        'solution_image',
        'results',
        'results_ar',
        'results_image',
        'technologies',
        'technologies_ar',
        'cover_image',
        'project_url',
        'completed_at',
        'is_featured',
        'is_published',
        'display_order',
        'seo_title',
        'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'technologies'    => 'array',
            'technologies_ar' => 'array',
            'completed_at'    => 'date',
            'is_featured'     => 'boolean',
            'is_published'    => 'boolean',
            'display_order'   => 'integer',
        ];
    }

    // ──────────────────────────────────────────────
    //  Relationships
    // ──────────────────────────────────────────────

    /**
     * The linked client (nullable — null when client is deleted).
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
