<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Service extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'parent_id',
        'title',
        'title_ar',
        'slug',
        'short_description',
        'short_description_ar',
        'description',
        'description_ar',
        'icon',
        'image',
        'display_order',
        'is_active',
        'seo_title',
        'seo_description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active'     => 'boolean',
            'display_order' => 'integer',
        ];
    }

    // ──────────────────────────────────────────────
    //  Relationships
    // ──────────────────────────────────────────────

    /**
     * The parent service (null for top-level services).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'parent_id');
    }

    /**
     * Active, non-deleted subservices ordered by display_order then title.
     */
    public function subServices(): HasMany
    {
        return $this->hasMany(Service::class, 'parent_id')
                    ->where('is_active', true)
                    ->orderBy('display_order')
                    ->orderBy('title');
    }

    /**
     * All subservices (including inactive/deleted) — used for admin operations.
     */
    public function allSubServices(): HasMany
    {
        return $this->hasMany(Service::class, 'parent_id');
    }

    // ──────────────────────────────────────────────
    //  Scopes
    // ──────────────────────────────────────────────

    /**
     * Scope: only active, non-deleted services.
     */
    public function scopeActive($query): void
    {
        $query->where('is_active', true);
    }

    /**
     * Scope: only top-level (parent) services.
     */
    public function scopeTopLevel($query): void
    {
        $query->whereNull('parent_id');
    }
}
