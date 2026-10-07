<?php

namespace Modules\Auth\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSocialConnection extends Model
{
    use HasFactory;

    protected $table = 'user_social_connections';

    protected $fillable = [
        'user_id',
        'provider',
        'provider_id',
        'provider_data',
    ];

    protected function casts(): array
    {
        return [
            'provider_data' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function findByProvider(string $provider, string $providerId): ?static
    {
        return static::query()
            ->where('provider', $provider)
            ->where('provider_id', $providerId)
            ->first();
    }
}
