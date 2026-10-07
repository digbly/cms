<?php

use App\Themes\DatabaseActivator;
use App\Themes\FileActivator;

return [

    /*
    |--------------------------------------------------------------------------
    | Composer Vendor
    |--------------------------------------------------------------------------
    |
    | The vendor name used by theme:make when generating a theme composer.json.
    |
    */

    'composer' => [
        'vendor' => env('THEME_VENDOR', 'juzaweb'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Theme
    |--------------------------------------------------------------------------
    |
    | The theme alias used when no active theme is stored or when the configured
    | theme is missing/disabled.
    |
    */

    'default' => env('THEME_DEFAULT', 'default'),

    /*
    |--------------------------------------------------------------------------
    | Current Theme
    |--------------------------------------------------------------------------
    |
    | Resolved at boot time by the ThemeManager. Read-only at runtime.
    |
    */

    'current' => null,

    /*
    |--------------------------------------------------------------------------
    | Paths
    |--------------------------------------------------------------------------
    */

    'paths' => [
        'themes' => base_path('themes'),
        'assets' => public_path('themes'),
        'assets_url' => env('THEME_ASSETS_URL', 'themes'),

        'generator' => [
            'views' => 'resources/views',
            'assets' => 'resources/assets',
            'lang' => 'resources/lang',
            'config' => 'config',
            'routes' => 'routes',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Scan Path
    |--------------------------------------------------------------------------
    |
    | Additional theme locations. Useful when themes are hosted in vendor.
    |
    */

    'scan' => [
        'enabled' => false,
        'paths' => [
            base_path('vendor/*/*'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Registration
    |--------------------------------------------------------------------------
    */

    'register' => [
        'translations' => true,
        'files' => 'register',
    ],

    /*
    |--------------------------------------------------------------------------
    | Server Side Rendering
    |--------------------------------------------------------------------------
    |
    | Each theme may ship its own SSR bundle and server. A theme declares them
    | in `theme.json` under the `ssr` key (enabled, host, port, bundle); the
    | values here are the defaults used when a theme omits them.
    |
    | `enabled` acts as a master switch: when set to false, theme SSR is
    | disabled regardless of `theme.json`. Leave it unset to respect
    | `inertia.ssr.enabled` (INERTIA_SSR_ENABLED).
    |
    | `output` is the directory, relative to the project root, where built
    | per-theme bundles live. The default bundle for a theme is
    | `<output>/<alias>/ssr.js`.
    |
    */

    'ssr' => [
        'enabled' => env('THEME_SSR_ENABLED'),
        'host' => env('THEME_SSR_HOST', '127.0.0.1'),
        'output' => 'bootstrap/ssr/themes',
    ],

    /*
    |--------------------------------------------------------------------------
    | Activators
    |--------------------------------------------------------------------------
    |
    | The file activator stores activation statuses in a JSON file, the same
    | way nwidart/laravel-modules stores module statuses. The database activator
    | stores the active theme name in the settings, so only one theme can be
    | active at a time.
    |
    */

    'activators' => [
        'file' => [
            'class' => FileActivator::class,
            'statuses-file' => base_path('themes/statuses.json'),
        ],

        'database' => [
            'class' => DatabaseActivator::class,
            'key' => 'theme',
        ],
    ],

    'activator' => env('THEMES_ACTIVATOR', 'database'),

];
