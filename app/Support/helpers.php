<?php

use App\Contracts\ThemeSetting as ThemeSettingContract;
use App\Themes\FileRepository;
use App\Themes\Theme;
use App\Themes\ThemeManager;

if (! function_exists('is_json')) {
    function is_json(mixed $value): bool
    {
        if (! is_string($value) || $value === '') {
            return false;
        }

        try {
            json_decode($value, true, 512, JSON_THROW_ON_ERROR);

            return true;
        } catch (Throwable) {
            return false;
        }
    }
}

if (! function_exists('theme')) {
    function theme(): ?Theme
    {
        if (! app()->bound(ThemeManager::class)) {
            return null;
        }

        return app(ThemeManager::class)->current();
    }
}

if (! function_exists('theme_name')) {
    function theme_name(): ?string
    {
        if (app()->bound(ThemeManager::class)) {
            $name = app(ThemeManager::class)->name();

            if ($name !== null) {
                return $name;
            }
        }

        return config('themes.default');
    }
}

if (! function_exists('theme_setting')) {
    /**
     * Get a theme setting value, or the theme setting repository when called
     * without arguments.
     */
    function theme_setting(?string $key = null, mixed $default = null): mixed
    {
        if (func_num_args() > 0) {
            return app(ThemeSettingContract::class)->get($key, $default);
        }

        return app(ThemeSettingContract::class);
    }
}

if (! function_exists('theme_path')) {
    function theme_path(string $theme, string $path = ''): string
    {
        $base = app()->bound(FileRepository::class)
            ? app(FileRepository::class)->getThemePath($theme)
            : config('themes.paths.themes').'/'.$theme;

        return $path !== '' ? $base.'/'.ltrim($path, '/') : $base;
    }
}

if (! function_exists('admin_url')) {
    function admin_url(?string $uri = null): string
    {
        $segments = array_filter(
            [config('app.admin_prefix', 'admin'), ltrim((string) $uri, '/')],
            fn ($segment) => $segment !== null && $segment !== ''
        );

        return url(implode('/', $segments));
    }
}

if (! function_exists('theme_asset')) {
    function theme_asset(string $asset, ?string $theme = null): string
    {
        $theme ??= theme_name();

        return asset(trim(config('themes.paths.assets_url', 'themes'), '/').'/'.$theme.'/'.ltrim($asset, '/'));
    }
}
