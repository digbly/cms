<?php

namespace Modules\Admin\Providers;

use App\Facades\AdminTranslation;
use App\Facades\Menu;
use App\Facades\NavMenu;
use App\Facades\Setting;
use App\Support\MenuRepository;
use Illuminate\Console\Scheduling\Schedule;
use Modules\Admin\Enums\DashboardPermission;
use Modules\Admin\Enums\MediaPermission;
use Modules\Admin\Enums\MenuPermission;
use Modules\Admin\Enums\PagePermission;
use Modules\Admin\Enums\SettingPermission;
use Modules\Admin\Enums\ThemePermission;
use Modules\Admin\Enums\UserPermission;
use Modules\Admin\Enums\WidgetPermission;
use Modules\Auth\Enums\SocialProvider;
use Nwidart\Modules\Support\ModuleServiceProvider;

class AdminServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'Admin';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'admin';

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

        $this->registerNavigation();
        $this->registerMenuLocations();
        $this->registerSettings();
        $this->registerAdminTranslations();
    }

    /**
     * Register the admin SPA translation namespace owned by this module.
     */
    protected function registerAdminTranslations(): void
    {
        AdminTranslation::make($this->nameLower, fn (): array => [
            'group' => 'admin',
            'path' => module_path($this->name, 'resources/lang'),
        ]);
    }

    /**
     * Register the navigation menu locations a menu can be assigned to.
     *
     * These live here rather than in the theme because the admin API must
     * expose them even when no theme is booted for the current request. Themes
     * may register additional locations through the same facade.
     */
    protected function registerMenuLocations(): void
    {
        NavMenu::make('primary', fn () => [
            'label' => __('admin.navMenu.primary'),
        ]);

        NavMenu::make('footer', fn () => [
            'label' => __('admin.navMenu.footer'),
        ]);
    }

    /**
     * Register the admin SPA sidebar items owned by this module.
     *
     * Feature modules register their own items; items are lazy callbacks so
     * labels are translated using the locale of the incoming request.
     */
    protected function registerNavigation(): void
    {
        $position = MenuRepository::POSITION_ADMIN;

        Menu::make('dashboard', fn () => [
            'label' => __('admin.nav.dashboard'),
            'to' => '/',
            'icon' => 'layout-dashboard',
            'permission' => DashboardPermission::View->value,
            'position' => $position,
            'priority' => 10,
        ]);

        Menu::make('media', fn () => [
            'label' => __('admin.nav.media'),
            'to' => '/media',
            'icon' => 'images',
            'permission' => MediaPermission::MediaView->value,
            'position' => $position,
            'priority' => 40,
        ]);

        Menu::make('users', fn () => [
            'label' => __('admin.nav.users'),
            'to' => '/users',
            'icon' => 'users',
            'permission' => UserPermission::Manage->value,
            'position' => $position,
            'priority' => 50,
        ]);

        Menu::make('settings', fn () => [
            'label' => __('admin.nav.settings'),
            'to' => '/settings',
            'icon' => 'settings',
            'permission' => SettingPermission::Manage->value,
            'position' => $position,
            'priority' => 60,
        ]);

        Menu::make('appearance', fn () => [
            'label' => __('admin.nav.appearance'),
            'icon' => 'palette',
            'position' => $position,
            'priority' => 90,
        ]);

        Menu::make('menus', fn () => [
            'label' => __('admin.nav.menus'),
            'to' => '/menus',
            'icon' => 'menu',
            'permission' => MenuPermission::View->value,
            'parent' => 'appearance',
            'position' => $position,
            'priority' => 10,
        ]);

        Menu::make('widgets', fn () => [
            'label' => __('admin.nav.widgets'),
            'to' => '/widgets',
            'icon' => 'layout-grid',
            'permission' => WidgetPermission::View->value,
            'parent' => 'appearance',
            'position' => $position,
            'priority' => 20,
        ]);

        Menu::make('customize', fn () => [
            'label' => __('admin.nav.customize'),
            'to' => '/customize',
            'icon' => 'palette',
            'permission' => ThemePermission::View->value,
            'parent' => 'appearance',
            'position' => $position,
            'priority' => 30,
        ]);

        Menu::make('pages', fn () => [
            'label' => __('admin.nav.pages'),
            'to' => '/pages',
            'icon' => 'file-text',
            'permission' => PagePermission::View->value,
            'parent' => 'appearance',
            'position' => $position,
            'priority' => 40,
        ]);
    }

    /**
     * Register the application setting definitions.
     */
    protected function registerSettings(): void
    {
        Setting::make('title')
            ->default((string) config('app.name'))
            ->type('string')
            ->translatable()
            ->rules(['nullable', 'string', 'max:255'])
            ->add();

        Setting::make('description')
            ->type('text')
            ->translatable()
            ->rules(['nullable', 'string', 'max:500'])
            ->add();

        Setting::make('sitename')
            ->type('string')
            ->rules(['nullable', 'string', 'max:120'])
            ->add();

        Setting::make('logo')
            ->type('media')
            ->rules(['nullable', 'string', 'uuid'])
            ->add();

        Setting::make('favicon')
            ->type('media')
            ->rules(['nullable', 'string', 'uuid'])
            ->add();

        Setting::make('banner')
            ->type('media')
            ->rules(['nullable', 'string', 'uuid'])
            ->add();

        Setting::make('user_registration')
            ->default(true)
            ->type('boolean')
            ->rules(['nullable', 'boolean'])
            ->add();

        Setting::make('user_verification')
            ->default(false)
            ->type('boolean')
            ->rules(['nullable', 'boolean'])
            ->add();

        $this->registerSocialLoginSettings();
    }

    /**
     * Register the per-provider social login definitions. Credentials left
     * empty fall back to the values from the environment configuration.
     */
    protected function registerSocialLoginSettings(): void
    {
        foreach (SocialProvider::cases() as $provider) {
            Setting::make($provider->settingKey('enabled'))
                ->label($provider->label().' login')
                ->default($provider->hasEnvironmentCredentials())
                ->type('boolean')
                ->rules(['nullable', 'boolean'])
                ->disableShowApi()
                ->add();

            Setting::make($provider->settingKey('client_id'))
                ->type('string')
                ->rules(['nullable', 'string', 'max:255'])
                ->disableShowApi()
                ->add();

            Setting::make($provider->settingKey('client_secret'))
                ->type('string')
                ->rules(['nullable', 'string', 'max:255'])
                ->disableShowApi()
                ->add();
        }
    }

    /**
     * Define module schedules.
     *
     * @param  $schedule
     */
    // protected function configureSchedules(Schedule $schedule): void
    // {
    //     $schedule->command('inspire')->hourly();
    // }
}
