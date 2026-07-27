<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClientReach extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone_number',
        'company_name',
        'subject',
        'message_type',
        'message',
        'status',
        'internal_notes',
        'handled_at',
    ];

    /**
     * The attributes that should be hidden from public responses.
     * internal_notes and handled_at are administrative fields.
     *
     * @var list<string>
     */
    protected $hidden = [
        'internal_notes',
        'handled_at',
        'deleted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'handled_at' => 'datetime',
        ];
    }
}
