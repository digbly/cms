<?php

namespace App\Modules;

use Illuminate\Database\Migrations\Migrator;
use Nwidart\Modules\Contracts\RepositoryInterface;
use Nwidart\Modules\LaravelModulesServiceProvider;

class ModulesServiceProvider extends LaravelModulesServiceProvider
{
    /**
     * Modules are registered from boot() so a database-backed activator can
     * read the stored activation settings.
     */
    protected bool $deferModuleRegistration = true;

    /**
     * {@inheritdoc}
     */
    public function register(): void
    {
        parent::register();

        // nwidart's ContractsServiceProvider rebinds the repository to its own
        // implementation while parent::register() runs, so rebind last to keep
        // App\Modules\FileRepository (custom module path resolution).
        $this->app->singleton(RepositoryInterface::class, function ($app) {
            return new FileRepository($app, $app['config']->get('modules.paths.modules'));
        });
    }

    public function boot(): void
    {
        parent::boot();

        $this->deferModuleRegistration = false;

        $this->registerModules();
    }

    /**
     * {@inheritdoc}
     */
    protected function registerModules(): void
    {
        if ($this->deferModuleRegistration) {
            return;
        }

        parent::registerModules();
    }

    /**
     * Register every module's migrations, regardless of activation status.
     *
     * Activation controls providers, routes and translations; it must not gate
     * schema, otherwise an installed-but-disabled module would never have its
     * tables created (e.g. the Auth module owns the `users` table).
     *
     * {@inheritdoc}
     */
    protected function registerMigrations(): void
    {
        if (! $this->app['config']->get('modules.auto-discover.migrations', true)) {
            return;
        }

        $this->app->resolving(Migrator::class, function (Migrator $migrator) {
            $migrationPath = $this->app['config']->get('modules.paths.generator.migration.path');

            foreach ($this->app[RepositoryInterface::class]->all() as $module) {
                $migrator->path($module->getExtraPath($migrationPath));
            }
        });
    }
}
