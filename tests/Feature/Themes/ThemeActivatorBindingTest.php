<?php

namespace Tests\Feature\Themes;

use App\Contracts\ThemeActivator;
use App\Themes\DatabaseActivator;
use App\Themes\Exceptions\InvalidThemeActivator;
use App\Themes\FileActivator;
use Tests\TestCase;

class ThemeActivatorBindingTest extends TestCase
{
    public function test_default_activator_is_the_database_activator(): void
    {
        $this->assertInstanceOf(DatabaseActivator::class, $this->app->make(ThemeActivator::class));
    }

    public function test_activator_class_is_resolved_from_config(): void
    {
        config(['themes.activators.database.class' => CustomThemeActivator::class]);
        $this->app->forgetInstance(ThemeActivator::class);

        $this->assertInstanceOf(CustomThemeActivator::class, $this->app->make(ThemeActivator::class));
    }

    public function test_activator_key_selects_the_configured_activator(): void
    {
        config([
            'themes.activators.custom' => ['class' => CustomThemeActivator::class],
            'themes.activator' => 'custom',
        ]);
        $this->app->forgetInstance(ThemeActivator::class);

        $this->assertInstanceOf(CustomThemeActivator::class, $this->app->make(ThemeActivator::class));
    }

    public function test_invalid_activator_configuration_throws(): void
    {
        config(['themes.activator' => 'missing']);
        $this->app->forgetInstance(ThemeActivator::class);

        $this->expectException(InvalidThemeActivator::class);

        $this->app->make(ThemeActivator::class);
    }
}

class CustomThemeActivator extends FileActivator {}
