<?php

namespace Tests\Feature\Themes;

use App\Themes\Theme;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Str;
use Tests\TestCase;

class ThemeSsrTest extends TestCase
{
    protected string $themesPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->themesPath = sys_get_temp_dir().'/laravel-theme-ssr-'.uniqid();
        (new Filesystem)->ensureDirectoryExists($this->themesPath);

        config(['themes.paths.themes' => $this->themesPath]);
    }

    protected function tearDown(): void
    {
        (new Filesystem)->deleteDirectory($this->themesPath);

        parent::tearDown();
    }

    protected function makeTheme(string $alias, array $ssr = []): Theme
    {
        $name = Str::studly($alias);
        $path = $this->themesPath.'/'.$name;
        $files = new Filesystem;
        $files->ensureDirectoryExists($path);
        $files->put($path.'/theme.json', json_encode([
            'name' => $name,
            'alias' => $alias,
            'ssr' => $ssr,
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return new Theme($this->app, $name, $path);
    }

    public function test_default_ssr_settings_are_derived_from_config(): void
    {
        $settings = $this->makeTheme('blog')->ssrSettings();

        $this->assertTrue($settings['enabled']);
        $this->assertSame('127.0.0.1', $settings['host']);
        $this->assertSame(13714, $settings['port']);
        $this->assertSame(base_path('bootstrap/ssr/themes/blog/ssr.js'), $settings['bundle']);
    }

    public function test_theme_manifest_overrides_ssr_settings(): void
    {
        $settings = $this->makeTheme('blog', [
            'enabled' => false,
            'host' => '0.0.0.0',
            'port' => 14000,
            'bundle' => '/tmp/custom-ssr.js',
        ])->ssrSettings();

        $this->assertFalse($settings['enabled']);
        $this->assertSame('0.0.0.0', $settings['host']);
        $this->assertSame(14000, $settings['port']);
        $this->assertSame('/tmp/custom-ssr.js', $settings['bundle']);
    }

    public function test_register_ssr_points_inertia_at_the_theme(): void
    {
        config(['inertia.ssr.enabled' => true, 'themes.ssr.enabled' => null]);

        $this->makeTheme('blog', ['port' => 14000])->registerSsr();

        $this->assertTrue(config('inertia.ssr.enabled'));
        $this->assertSame('http://127.0.0.1:14000', config('inertia.ssr.url'));
        $this->assertSame(base_path('bootstrap/ssr/themes/blog/ssr.js'), config('inertia.ssr.bundle'));
    }

    public function test_register_ssr_respects_theme_and_global_switches(): void
    {
        config(['inertia.ssr.enabled' => true, 'themes.ssr.enabled' => null]);
        $this->makeTheme('blog', ['enabled' => false])->registerSsr();
        $this->assertFalse(config('inertia.ssr.enabled'));

        config(['inertia.ssr.enabled' => true, 'themes.ssr.enabled' => false]);
        $this->makeTheme('blog')->registerSsr();
        $this->assertFalse(config('inertia.ssr.enabled'));

        config(['inertia.ssr.enabled' => false, 'themes.ssr.enabled' => true]);
        $this->makeTheme('blog')->registerSsr();
        $this->assertFalse(config('inertia.ssr.enabled'));
    }
}
