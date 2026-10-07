<?php

namespace App\Themes;

use App\Contracts\ThemeActivator;
use App\Http\Middleware\ThemeSsr;
use Illuminate\Container\Container;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Foundation\AliasLoader;
use Illuminate\Foundation\ProviderRepository;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Nwidart\Modules\Json;

class Theme
{
    protected Container $app;

    protected string $name;

    protected string $path;

    protected Filesystem $files;

    protected ThemeActivator $activator;

    protected array $manifests = [];

    public function __construct(Container $app, string $name, string $path)
    {
        $this->app = $app;
        $this->name = $name;
        $this->path = $path;
        $this->files = $app['files'];
        $this->activator = $app->make(ThemeActivator::class);
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getLowerName(): string
    {
        return Str::lower($this->getAlias() ?: $this->name);
    }

    public function getStudlyName(): string
    {
        return Str::studly($this->name);
    }

    public function getAlias(): ?string
    {
        return $this->get('alias');
    }

    public function getPath(): string
    {
        return $this->path;
    }

    public function getViewsPath(): string
    {
        return $this->resourcePath('views');
    }

    public function getAssetsPath(): string
    {
        return $this->resourcePath('assets');
    }

    public function getTranslationsPath(): string
    {
        return $this->resourcePath('lang');
    }

    public function getConfigPath(): string
    {
        return $this->getPath().'/'.trim(config('themes.paths.generator.config', 'config'), '/');
    }

    public function getRoutesPath(): string
    {
        return $this->getPath().'/'.trim(config('themes.paths.generator.routes', 'routes'), '/');
    }

    /**
     * Absolute path to the theme's Vite "hot" file.
     *
     * Each theme runs its own Vite server, so its hot file lives inside the
     * theme build directory instead of the shared application `public/hot`.
     * This keeps the theme bundle from being hijacked when the application's
     * own Vite dev server is running.
     */
    public function getHotFilePath(): string
    {
        return rtrim((string) config('themes.paths.assets', public_path('themes')), '/')
            .'/'.$this->getLowerName().'/hot';
    }

    public function json(?string $file = null): Json
    {
        $file ??= 'theme.json';

        return Arr::get($this->manifests, $file, function () use ($file) {
            return $this->manifests[$file] = new Json($this->getPath().'/'.$file, $this->files);
        });
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->json()->get($key, $default);
    }

    public function register(): void
    {
        $this->registerAliases();
        $this->registerProviders();

        if (config('themes.register.files', 'register') === 'register') {
            $this->registerFiles();
        }
    }

    public function boot(): void
    {
        if (config('themes.register.files', 'register') === 'boot') {
            $this->registerFiles();
        }
    }

    public function registerProviders(): void
    {
        $providers = $this->get('providers', []);

        if (empty($providers)) {
            return;
        }

        (new ProviderRepository($this->app, new Filesystem, $this->getCachedServicesPath()))
            ->load($providers);
    }

    public function registerAliases(): void
    {
        $loader = AliasLoader::getInstance();

        foreach ($this->get('aliases', []) as $alias => $class) {
            $loader->alias($alias, $class);
        }
    }

    public function registerFiles(): void
    {
        foreach ($this->get('files', []) as $file) {
            include_once $this->getPath().'/'.$file;
        }
    }

    public function registerTranslations(): void
    {
        $path = $this->getTranslationsPath();

        if (! is_dir($path)) {
            return;
        }

        $this->app['translator']->addNamespace($this->getLowerName(), $path);
    }

    public function registerRoutes(): void
    {
        $path = $this->getRoutesPath().'/web.php';

        if (! is_file($path)) {
            return;
        }

        Route::middleware(['web', ThemeSsr::class])->group($path);

        // Routes defined by a theme are registered dynamically (during boot or
        // when previewing a theme at runtime), after the router may have
        // already built its name/action lookups. Refresh them so `route()`
        // resolves naming for the newly added routes.
        Route::getRoutes()->refreshNameLookups();
        Route::getRoutes()->refreshActionLookups();
    }

    public function registerViews(): void
    {
        $path = $this->getViewsPath();

        if (! is_dir($path)) {
            return;
        }

        $view = $this->app['view'];
        $view->addNamespace($this->getLowerName(), $path);

        $finder = $view->getFinder();

        if (method_exists($finder, 'prependLocation')) {
            $finder->prependLocation($path);
        }
    }

    public function registerConfig(): void
    {
        $path = $this->getConfigPath();

        if (! is_dir($path)) {
            return;
        }

        foreach ($this->files->glob($path.'/*.php') as $file) {
            $key = basename($file, '.php');
            $configKey = $key === 'config' ? $this->getLowerName() : $this->getLowerName().'.'.$key;

            $this->app['config']->set(
                $configKey,
                array_replace_recursive($this->app['config']->get($configKey, []), require $file)
            );
        }
    }

    /**
     * Resolve the server-side rendering settings declared by the theme.
     *
     * `theme.json` may declare an `ssr` object with `enabled`, `host`, `port`
     * and `bundle` keys. Missing values fall back to `config('themes.ssr')`.
     *
     * @return array{enabled: bool, host: string, port: int, bundle: string}
     */
    public function ssrSettings(): array
    {
        $ssr = (array) $this->get('ssr', []);

        $bundle = $ssr['bundle']
            ?? trim((string) config('themes.ssr.output', 'bootstrap/ssr/themes'), '/').'/'.$this->getLowerName().'/ssr.js';

        return [
            'enabled' => filter_var($ssr['enabled'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'host' => (string) ($ssr['host'] ?? config('themes.ssr.host', '127.0.0.1')),
            'port' => (int) ($ssr['port'] ?? 13714),
            'bundle' => str_starts_with($bundle, '/') ? $bundle : base_path($bundle),
        ];
    }

    /**
     * Point Inertia's SSR gateway at this theme's bundle and server.
     *
     * Called on theme routes only, so the application's own Inertia pages keep
     * using whatever SSR configuration they were given.
     */
    public function registerSsr(): void
    {
        $settings = $this->ssrSettings();

        $enabled = $settings['enabled'] && (bool) config('inertia.ssr.enabled', true);

        $global = config('themes.ssr.enabled');

        if ($global !== null && $global !== '') {
            $enabled = $enabled && filter_var($global, FILTER_VALIDATE_BOOLEAN);
        }

        if (! $enabled) {
            config(['inertia.ssr.enabled' => false]);

            return;
        }

        config([
            'inertia.ssr.enabled' => true,
            'inertia.ssr.bundle' => $settings['bundle'],
            'inertia.ssr.url' => sprintf('http://%s:%d', $settings['host'], $settings['port']),
        ]);
    }

    public function getCachedServicesPath(): string
    {
        return Str::replaceLast(
            'services.php',
            $this->getLowerName().'_theme.php',
            $this->app->getCachedServicesPath()
        );
    }

    public function isStatus(bool $status): bool
    {
        return $this->activator->hasStatus($this, $status);
    }

    public function isEnabled(): bool
    {
        return $this->activator->hasStatus($this, true);
    }

    public function isDisabled(): bool
    {
        return ! $this->isEnabled();
    }

    public function setActive(bool $active): void
    {
        $this->activator->setActive($this, $active);
    }

    public function enable(): void
    {
        $this->activator->enable($this);
    }

    public function disable(): void
    {
        $this->activator->disable($this);
    }

    public function __toString(): string
    {
        return $this->getStudlyName();
    }

    protected function resourcePath(string $key): string
    {
        $default = config('themes.paths.generator.'.$key, 'resources/'.$key);

        return $this->getPath().'/'.trim($this->get($key, $default), '/');
    }
}
