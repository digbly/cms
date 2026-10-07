<?php

namespace App\Themes;

use App\Contracts\ThemeActivator;
use App\Themes\Exceptions\InvalidThemeActivator;
use Illuminate\Support\ServiceProvider;

class ThemesServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(dirname(__DIR__, 2).'/config/themes.php', 'themes');

        $this->app->singleton(ThemeActivator::class, function ($app) {
            $activator = $app['config']->get('themes.activator');
            $class = $app['config']->get('themes.activators.'.$activator.'.class');

            if (! is_string($class) || ! class_exists($class)) {
                throw InvalidThemeActivator::missingConfig();
            }

            return new $class($app);
        });

        $this->app->singleton(FileRepository::class, function ($app) {
            return new FileRepository($app, $app['config']->get('themes.paths.themes'));
        });
        $this->app->alias(FileRepository::class, 'themes');

        $this->app->singleton(ThemeManager::class, function ($app) {
            return new ThemeManager($app, $app->make(FileRepository::class));
        });
    }

    public function boot(): void
    {
        $repository = $this->app->make(FileRepository::class);

        $repository->register();
        $repository->boot();

        $this->app->make(ThemeManager::class)->activate();
    }

    public function provides(): array
    {
        return [ThemeActivator::class, FileRepository::class, ThemeManager::class, 'themes'];
    }
}
