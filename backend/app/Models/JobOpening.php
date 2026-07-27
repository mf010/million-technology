<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobOpening extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'title',
        'title_ar',
        'slug',
        'department',
        'department_ar',
        'location',
        'location_ar',
        'employment_type',
        'employment_type_ar',
        'workplace_type',
        'workplace_type_ar',
        'summary',
        'summary_ar',
        'description',
        'description_ar',
        'responsibilities',
        'responsibilities_ar',
        'requirements',
        'requirements_ar',
        'application_email',
        'application_url',
        'status',
        'published_at',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'expires_at'   => 'datetime',
        ];
    }

    // ──────────────────────────────────────────────
    //  Scopes
    // ──────────────────────────────────────────────

    /**
     * Scope: publicly visible job openings.
     * - status = open
     * - published_at <= now()
     * - expires_at is null OR expires_at > now()
     */
    public function scopePubliclyVisible($query): void
    {
        $query->where('status', 'open')
              ->where('published_at', '<=', now())
              ->where(function ($q) {
                  $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
              });
    }
}
