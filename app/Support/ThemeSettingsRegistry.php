<?php

namespace App\Support;

/**
 * Global in-memory registry of theme setting definitions.
 *
 * Themes register definitions once at boot and the {@see ThemeSettingRepository}
 * reads them back to resolve values from the database.
 */
class ThemeSettingsRegistry
{
    /**
     * @var array<string, array<string, mixed>>
     */
    protected static array $settings = [];

    /**
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
