<?php

namespace Tests\Feature\Themes;

use App\Contracts\Setting as SettingContract;
use App\Themes\DatabaseActivator;
use App\Themes\Theme;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class ThemeDatabaseActivatorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    protected function activator(): DatabaseActivator
    {
        return new DatabaseActivator($this->app);
    }

    protected function theme(string $name): Theme
    {
        return new Theme($this->app, $name, sys_get_temp_dir().'/'.$name);
    }

    public function test_theme_is_disabled_when_no_active_theme_is_stored(): void
    {
        $this->assertTrue($this->activator()->hasStatus('Alpha', false));
        $this->assertFalse($this->activator()->hasStatus('Alpha', true));
    }

    public function test_enable_stores_the_active_theme(): void
    {
        $this->activator()->enable($this->theme('Alpha'));

        $this->assertSame('Alpha', $this->activator()->activeTheme());
        $this->assertTrue($this->activator()->hasStatus('Alpha', true));
        $this->assertFalse($this->activator()->hasStatus('Beta', true));
    }

    public function test_only_one_theme_can_be_active_at_a_time(): void
    {
        $activator = $this->activator();

        $activator->enable($this->theme('Alpha'));
        $activator->enable($this->theme('Beta'));

        $this->assertTrue($activator->hasStatus('Beta', true));
        $this->assertFalse($activator->hasStatus('Alpha', true));
    }

    public function test_disable_clears_the_active_theme(): void
    {
        $activator = $this->activator();

        $activator->enable($this->theme('Alpha'));
        $activator->disable($this->theme('Alpha'));

        $this->assertNull($activator->activeTheme());
        $this->assertTrue($activator->hasStatus('Alpha', false));
    }

    public function test_reset_clears_the_active_theme(): void
    {
        $activator = $this->activator();

        $activator->enable($this->theme('Alpha'));
        $activator->reset();

        $this->assertNull($activator->activeTheme());
    }

    public function test_has_no_active_theme_when_settings_unavailable(): void
    {
        $setting = Mockery::mock(SettingContract::class);
        $setting->shouldReceive('get')->andThrow(new RuntimeException('settings unavailable'));

        $this->app->instance(SettingContract::class, $setting);

        $this->assertNull((new DatabaseActivator($this->app))->activeTheme());
    }
}
