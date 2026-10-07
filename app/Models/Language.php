<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class Language extends Model
{
    protected $table = 'languages';

    protected $fillable = [
        'code',
        'name',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /**
     * All languages keyed by their code.
     */
    public static function languages(): Collection
    {
        return static::query()->get()->keyBy('code');
    }

    /**
     * @return list<string>
     */
    public static function codes(): array
    {
        return array_values(static::languages()->keys()->all());
    }

    /**
     * @return list<string>
     */
    public static function codesWithoutFallback(): array
    {
        return array_values(
            static::languages()
                ->keys()
                ->reject(fn (string $code) => $code === config('translatable.fallback_locale'))
                ->all()
        );
    }

    /**
     * The default language code.
     */
    public static function default(): string
    {
        $default = static::query()->where('is_default', true)->value('code');

        return $default ?? config('translatable.fallback_locale');
    }

    public static function existsCode(string $code): bool
    {
        return static::query()->where('code', $code)->exists();
    }
}
