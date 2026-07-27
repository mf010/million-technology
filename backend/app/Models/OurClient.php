<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OurClient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'logo',
        'website_url',
        'description',
        'description_ar',
        'is_featured',
        'is_active',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_featured'   => 'boolean',
            'is_active'     => 'boolean',
            'display_order' => 'integer',
        ];
    }

    // ──────────────────────────────────────────────
    //  Relationships
    // ──────────────────────────────────────────────

    /**
     * Published projects linked to this client.
     */
    public function projects(): HasMany
    {
        return $this->hasMany(PreviousProject::class, 'our_client_id');
    }

    // ──────────────────────────────────────────────
    //  Scopes
    // ──────────────────────────────────────────────

    public function scopeActive($query): void
    {
        $query->where('is_active', true);
    }
}
