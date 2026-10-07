<?php

namespace Modules\Auth\Providers;

use App\Facades\AdminTranslation;
use Illuminate\Support\Facades\Gate;
use Modules\Auth\Models\User;
use Nwidart\Modules\Support\ModuleServiceProvider;

class AuthServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'Auth';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'auth';

    /**
     * Command classes to register.
     *
     * @var string[]
     */
    // protected array $commands = [];

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];

    /**
     * Bootstrap module services.
     */
    public function boot(): void
    {
        parent::boot();

        Gate::before(
            static fn (User $user): ?bool => $user->isSuperAdmin() ? true : null
        );

        $this->registerAdminTranslations();
    }

    /**
     * Register the admin SPA translation namespace owned by this module.
     */
    protected function registerAdminTranslations(): void
    {
        AdminTranslation::make($this->nameLower, fn (): array => [
            'group' => 'admin_auth',
            'path' => module_path($this->name, 'resources/lang'),
        ]);
    }
}
