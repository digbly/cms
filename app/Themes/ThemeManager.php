<?php

namespace App\Themes;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\Arr;

class ThemeManager
{
    protected ?Theme $current = null;

    public function __construct(protected Application $app, protected FileRepository $repository) {}

    public function resolve(null|string|Theme $theme = null): ?Theme
    {
        if ($theme instanceof Theme) {
            return $theme;
        }

        $candidates = array_filter([
            $theme,
            $this->app['config']->get('themes.default'),
        ]);

        foreach ($candidates as $candidate) {
            $resolved = $this->repository->find($candidate);

            if ($resolved !== null && $resolved->isEnabled()) {
                return $resolved;
            }
        }

        return Arr::first($this->repository->allEnabled());
    }

    public function activate(null|string|Theme $theme = null): ?Theme
    {
        $theme = $this->resolve($theme);

        if ($theme === null) {
            return $this->current = null;
        }

        $theme->registerViews();
        $theme->registerConfig();

        if ($this->app['config']->get('themes.register.translations', true) === true) {
            $theme->registerTranslations();
        }

        $theme->registerRoutes();

        $this->app['config']->set('themes.current', $theme->getLowerName());

        return $this->current = $theme;
    }

    public function current(): ?Theme
    {
        return $this->current;
    }

    public function name(): ?string
    {
        return $this->current?->getLowerName();
    }
}
