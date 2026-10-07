<?php

namespace Tests\Feature\Themes;

use App\Contracts\ThemeActivator;
use App\Themes\Exceptions\ThemeNotFoundException;
use App\Themes\FileActivator;
use App\Themes\FileRepository;
use App\Themes\Theme;
use App\Themes\ThemeManager;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;
use Tests\TestCase;

class ThemeTest extends TestCase
{
    protected Filesystem $files;

    protected string $themesPath;

    protected string $assetsPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->files = new Filesystem;
        $this->themesPath = sys_get_temp_dir().'/laravel-themes-'.uniqid();
        $this->assetsPath = sys_get_temp_dir().'/laravel-theme-assets-'.uniqid();

        $this->files->ensureDirectoryExists($this->themesPath);

        config([
            'themes.paths.themes' => $this->themesPath,
            'themes.paths.assets' => $this->assetsPath,
            'themes.activators.file.statuses-file' => $this->themesPath.'/statuses.json',
            'themes.default' => null,
        ]);

        $this->app->forgetInstance(ThemeActivator::class);
        $this->app->forgetInstance(FileRepository::class);
        $this->app->forgetInstance(ThemeManager::class);

        $this->app->singleton(ThemeActivator::class, fn ($app) => new FileActivator($app));
        $this->app->singleton(FileRepository::class, fn ($app) => new FileRepository($app, $this->themesPath));
        $this->app->alias(FileRepository::class, 'themes');
        $this->app->singleton(ThemeManager::class, fn ($app) => new ThemeManager($app, $app->make(FileRepository::class)));
    }

    protected function tearDown(): void
    {
        $this->files->deleteDirectory($this->themesPath);
        $this->files->deleteDirectory($this->assetsPath);

        parent::tearDown();
    }

    protected function repository(): FileRepository
    {
        return $this->app->make(FileRepository::class);
    }

    protected function manager(): ThemeManager
    {
        return $this->app->make(ThemeManager::class);
    }

    protected function makeTheme(
        string $name,
        bool $enabled = true,
        int $priority = 0,
        array $views = [],
        array $config = [],
        array $lang = [],
        array $assets = [],
        ?string $routes = null,
    ): Theme {
        $studly = Str::studly($name);
        $alias = Str::kebab($name);
        $directory = $this->themesPath.'/'.$studly;

        $this->files->ensureDirectoryExists($directory);
        $this->files->put($directory.'/theme.json', json_encode([
            'name' => $studly,
            'alias' => $alias,
            'priority' => $priority,
            'providers' => [],
            'aliases' => [],
            'files' => [],
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        foreach ($views as $view => $contents) {
            $path = $directory.'/resources/views/'.$view;
            $this->files->ensureDirectoryExists(dirname($path));
            $this->files->put($path, $contents);
        }

        if ($config !== []) {
            $this->files->ensureDirectoryExists($directory.'/config');
            $this->files->put($directory.'/config/config.php', "<?php\n\nreturn ".var_export($config, true).";\n");
        }

        foreach ($lang as $locale => $messages) {
            $path = $directory."/resources/lang/{$locale}/messages.php";
            $this->files->ensureDirectoryExists(dirname($path));
            $this->files->put($path, "<?php\n\nreturn ".var_export($messages, true).";\n");
        }

        foreach ($assets as $asset => $contents) {
            $path = $directory.'/resources/assets/'.$asset;
            $this->files->ensureDirectoryExists(dirname($path));
            $this->files->put($path, $contents);
        }

        if ($routes !== null) {
            $this->files->ensureDirectoryExists($directory.'/routes');
            $this->files->put($directory.'/routes/web.php', $routes);
        }

        if ($enabled) {
            $this->app->make(ThemeActivator::class)->setActiveByName($studly, true);
        }

        return new Theme($this->app, $studly, $directory);
    }

    public function test_repository_discovers_themes(): void
    {
        $this->makeTheme('Alpha');

        $this->assertSame(['alpha'], array_keys($this->repository()->all()));
        $this->assertSame('Alpha', $this->repository()->find('Alpha')->getName());
        $this->assertNull($this->repository()->find('Missing'));
    }

    public function test_find_or_fail_throws_for_unknown_theme(): void
    {
        $this->expectException(ThemeNotFoundException::class);

        $this->repository()->findOrFail('Missing');
    }

    public function test_repository_orders_enabled_themes_by_priority(): void
    {
        $this->makeTheme('Alpha', priority: 10);
        $this->makeTheme('Beta', priority: 5);
        $this->makeTheme('Gamma', enabled: false, priority: 1);

        $this->assertSame(['Beta', 'Alpha'], array_values(array_map(
            fn (Theme $theme) => $theme->getName(),
            $this->repository()->getOrdered()
        )));
    }

    public function test_repository_filters_by_status(): void
    {
        $this->makeTheme('Alpha');
        $this->makeTheme('Beta', enabled: false);

        $this->assertSame(['alpha'], array_keys($this->repository()->allEnabled()));
        $this->assertSame(['beta'], array_keys($this->repository()->allDisabled()));
    }

    public function test_resolve_prefers_requested_theme(): void
    {
        $this->makeTheme('Alpha');
        $this->makeTheme('Beta');

        $this->assertSame('Beta', $this->manager()->resolve('Beta')->getName());
    }

    public function test_resolve_falls_back_to_first_enabled_theme(): void
    {
        $this->makeTheme('Alpha', enabled: false);
        $this->makeTheme('Beta');

        config(['themes.default' => 'Alpha']);

        $this->assertSame('Beta', $this->manager()->resolve()->getName());
    }

    public function test_resolve_returns_null_when_no_theme_is_enabled(): void
    {
        $this->makeTheme('Alpha', enabled: false);

        $this->assertNull($this->manager()->resolve());
        $this->assertNull($this->manager()->activate());
    }

    public function test_activate_registers_namespaced_views_and_overrides_app_views(): void
    {
        $theme = $this->makeTheme('Blog', views: [
            'welcome.blade.php' => 'THEME_WELCOME',
        ]);

        $this->manager()->activate($theme);

        $this->assertStringContainsString('THEME_WELCOME', view('welcome')->render());
        $this->assertStringContainsString('THEME_WELCOME', view('blog::welcome')->render());
        $this->assertSame('blog', theme_name());
        $this->assertSame('blog', config('themes.current'));
    }

    public function test_hot_file_path_lives_in_the_theme_asset_directory(): void
    {
        $theme = $this->makeTheme('Blog');

        $this->assertSame($this->assetsPath.'/blog/hot', $theme->getHotFilePath());
    }

    public function test_activate_merges_theme_config(): void
    {
        $theme = $this->makeTheme('Blog', config: ['color' => 'red']);

        $this->manager()->activate($theme);

        $this->assertSame('red', config('blog.color'));
    }

    public function test_activate_registers_theme_translations(): void
    {
        $theme = $this->makeTheme('Blog', lang: ['en' => ['hello' => 'Hi']]);

        $this->manager()->activate($theme);

        $this->assertSame('Hi', trans('blog::messages.hello'));
    }

    public function test_activate_registers_theme_routes(): void
    {
        $theme = $this->makeTheme('Blog', routes: <<<'PHP'
        <?php

        use Illuminate\Support\Facades\Route;

        Route::get('/theme-probe', fn () => 'ok')->name('theme.probe');
        PHP);

        $this->manager()->activate($theme);

        $this->get('/theme-probe')->assertOk()->assertSee('ok');
    }

    public function test_theme_routes_register_ssr_gateway_for_the_active_theme(): void
    {
        $theme = $this->makeTheme('Blog', routes: <<<'PHP'
        <?php

        use Illuminate\Support\Facades\Route;

        Route::get('/theme-ssr', fn () => response()->json([
            'url' => config('inertia.ssr.url'),
            'bundle' => config('inertia.ssr.bundle'),
        ]))->name('theme.ssr');
        PHP);

        $this->manager()->activate($theme);

        $this->get('/theme-ssr')
            ->assertOk()
            ->assertJson([
                'url' => 'http://127.0.0.1:13714',
                'bundle' => base_path('bootstrap/ssr/themes/blog/ssr.js'),
            ]);
    }

    public function test_make_command_scaffolds_and_enables_theme(): void
    {
        $this->artisan('theme:make', ['name' => 'Blog'])->assertSuccessful();

        $directory = $this->themesPath.'/blog';

        $this->assertFileExists($directory.'/theme.json');
        $this->assertFileExists($directory.'/composer.json');
        $this->assertFileExists($directory.'/package.json');
        $this->assertFileExists($directory.'/vite.config.js');
        $this->assertFileExists($directory.'/tsconfig.json');
        $this->assertFileExists($directory.'/app/Providers/ThemeServiceProvider.php');
        $this->assertFileExists($directory.'/resources/views/theme.blade.php');
        $this->assertFileExists($directory.'/resources/views/app.tsx');
        $this->assertFileExists($directory.'/resources/views/ssr.tsx');
        $this->assertFileExists($directory.'/resources/views/lib/resolve-page.ts');
        $this->assertFileExists($directory.'/resources/views/lib/route.ts');
        $this->assertFileExists($directory.'/resources/views/pages/Home.tsx');
        $this->assertFileExists($directory.'/config/config.php');
        $this->assertFileExists($directory.'/routes/web.php');
        $this->assertFileExists($directory.'/resources/assets/css/app.css');
        $this->assertFileDoesNotExist($directory.'/resources/views/welcome.blade.php');

        $manifest = json_decode($this->files->get($directory.'/theme.json'), true);
        $this->assertSame('bootstrap/ssr/themes/blog/ssr.js', $manifest['ssr']['bundle'] ?? null);

        $this->assertTrue($this->repository()->findOrFail('Blog')->isEnabled());
    }

    public function test_make_command_does_not_overwrite_without_force(): void
    {
        $this->artisan('theme:make', ['name' => 'Blog'])->assertSuccessful();
        $this->artisan('theme:make', ['name' => 'Blog'])->assertFailed();
    }

    public function test_make_command_rejects_unsafe_name(): void
    {
        $this->artisan('theme:make', ['name' => '../evil'])->assertFailed();

        $this->assertSame([], $this->repository()->all());
        $this->assertFileDoesNotExist($this->themesPath.'/../evil/theme.json');
    }

    public function test_make_command_accepts_human_readable_name(): void
    {
        $this->artisan('theme:make', ['name' => 'My Theme'])->assertSuccessful();

        $this->assertFileExists($this->themesPath.'/my-theme/theme.json');
        $this->assertTrue($this->repository()->findOrFail('MyTheme')->isEnabled());
    }

    public function test_enable_and_disable_commands_toggle_status(): void
    {
        $this->makeTheme('Blog', enabled: false);

        $this->artisan('theme:enable', ['theme' => 'Blog'])->assertSuccessful();
        $this->assertTrue($this->repository()->findOrFail('Blog')->isEnabled());

        $this->artisan('theme:disable', ['theme' => 'Blog'])->assertSuccessful();
        $this->assertTrue($this->repository()->findOrFail('Blog')->isDisabled());
    }

    public function test_enable_command_fails_for_unknown_theme(): void
    {
        $this->artisan('theme:enable', ['theme' => 'Missing'])->assertFailed();
    }

    public function test_list_command_reports_themes(): void
    {
        $this->makeTheme('Alpha');
        $this->makeTheme('Beta', enabled: false);

        $this->artisan('theme:list')
            ->expectsOutputToContain('Alpha')
            ->expectsOutputToContain('Beta')
            ->assertSuccessful();
    }

    public function test_publish_command_copies_assets(): void
    {
        $this->makeTheme('Blog', assets: ['css/theme.css' => 'body{}']);

        $this->artisan('theme:publish', ['theme' => 'Blog'])->assertSuccessful();

        $this->assertFileExists($this->assetsPath.'/blog/css/theme.css');
    }
}
