<?php

namespace App\Themes;

use App\Contracts\ThemeActivator;
use App\Themes\Exceptions\ThemeNotFoundException;
use Illuminate\Container\Container;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;
use Nwidart\Modules\Json;

class FileRepository
{
    protected Container $app;

    protected ?string $path;

    protected Filesystem $files;

    protected ThemeActivator $activator;

    protected static array $themes = [];

    public function __construct(Container $app, ?string $path = null)
    {
        $this->app = $app;
        $this->path = $path;
        $this->files = $app['files'];
        $this->activator = $app->make(ThemeActivator::class);
    }

    public function getScanPaths(): array
    {
        $paths = [$this->getPath()];

        if ($this->config('scan.enabled')) {
            $paths = array_merge($paths, $this->config('scan.paths', []));
        }

        return array_map(
            fn (string $path) => Str::endsWith($path, '/*') ? $path : Str::finish($path, '/*'),
            $paths
        );
    }

    public function scan(): array
    {
        if (! empty(self::$themes) && ! $this->app->runningUnitTests()) {
            return self::$themes;
        }

        $themes = [];

        foreach ($this->getScanPaths() as $path) {
            foreach ((array) $this->files->glob("{$path}/theme.json") as $manifest) {
                $name = Json::make($manifest, $this->files)->get('name');

                if ($name === null) {
                    continue;
                }

                $themes[strtolower($name)] = new Theme($this->app, $name, dirname($manifest));
            }
        }

        return self::$themes = $themes;
    }

    public function all(): array
    {
        return $this->scan();
    }

    public function getByStatus(bool $status): array
    {
        return array_filter(
            $this->all(),
            fn (Theme $theme) => $theme->isStatus($status)
        );
    }

    public function allEnabled(): array
    {
        return $this->getByStatus(true);
    }

    public function allDisabled(): array
    {
        return $this->getByStatus(false);
    }

    public function getOrdered(string $direction = 'asc'): array
    {
        $themes = $this->allEnabled();

        uasort($themes, function (Theme $a, Theme $b) use ($direction) {
            if ($a->get('priority') === $b->get('priority')) {
                return 0;
            }

            return $direction === 'desc'
                ? ($a->get('priority') < $b->get('priority') ? 1 : -1)
                : ($a->get('priority') > $b->get('priority') ? 1 : -1);
        });

        return $themes;
    }

    public function getPath(): string
    {
        return $this->path ?: $this->config('paths.themes', base_path('themes'));
    }

    public function register(): void
    {
        foreach ($this->getOrdered() as $theme) {
            $theme->register();
        }
    }

    public function boot(): void
    {
        foreach ($this->getOrdered() as $theme) {
            $theme->boot();
        }
    }

    public function find(string $name): ?Theme
    {
        return $this->all()[strtolower($name)] ?? null;
    }

    /**
     * @throws ThemeNotFoundException
     */
    public function findOrFail(string $name): Theme
    {
        return $this->find($name) ?? throw ThemeNotFoundException::make($name);
    }

    public function getThemePath(string $theme): string
    {
        try {
            return $this->findOrFail($theme)->getPath();
        } catch (ThemeNotFoundException) {
            return $this->getPath().'/'.Str::slug($theme);
        }
    }

    public function config(string $key, mixed $default = null): mixed
    {
        return $this->app['config']->get('themes.'.$key, $default);
    }
}
