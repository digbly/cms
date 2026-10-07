<?php

namespace App\Support;

use App\Support\Entities\Setting;

/**
 * Global in-memory registry of the application setting definitions.
 *
 * Definitions are registered once at boot through the {@see Setting}
 * entity and read back by the {@see SettingRepository} and the admin validation
 * request. It intentionally replaces the previous `config('settings')` storage.
 */
class SettingsRegistry
{
    /**
     * @var array<string, array<string, mixed>>
     */
    protected static array $settings = [];

    /**
     * Register (or replace) a setting definition.
     *
     * @param  array<string, mixed>  $definition
     */
    public static function add(string $key, array $definition): void
    {
        static::$settings[$key] = $definition;
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    public static function all(): array
    {
        return static::$settings;
    }

    public static function flush(): void
    {
        static::$settings = [];
    }
}
