<?php

namespace Tests\Feature\Modules;

use App\Contracts\Setting as SettingContract;
use App\Modules\DatabaseActivator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use RuntimeException;
use Tests\TestCase;

class DatabaseActivatorTest extends TestCase
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

    public function test_module_is_disabled_by_default(): void
    {
        $this->assertTrue($this->activator()->hasStatus('Admin', false));
        $this->assertFalse($this->activator()->hasStatus('Admin', true));
    }

    public function test_enable_stores_the_module_status(): void
    {
        $this->activator()->setActiveByName('Admin', true);

        $this->assertTrue($this->activator()->hasStatus('Admin', true));
        $this->assertSame(['Admin' => true], $this->activator()->getModulesStatuses());
    }

    public function test_disable_removes_the_module_status(): void
    {
        $activator = $this->activator();

        $activator->setActiveByName('Admin', true);
        $activator->setActiveByName('Admin', false);

        $this->assertTrue($activator->hasStatus('Admin', false));
        $this->assertSame([], $activator->getModulesStatuses());
    }

    public function test_reset_clears_every_status(): void
    {
        $activator = $this->activator();

        $activator->setActiveByName('Admin', true);
        $activator->setActiveByName('Auth', true);
        $activator->reset();

        $this->assertSame([], $activator->getModulesStatuses());
    }

    public function test_has_no_active_modules_when_settings_unavailable(): void
    {
        $setting = Mockery::mock(SettingContract::class);
        $setting->shouldReceive('get')->andThrow(new RuntimeException('settings unavailable'));

        $this->app->instance(SettingContract::class, $setting);

        $this->assertSame([], (new DatabaseActivator($this->app))->getModulesStatuses());
    }
}
