<?php

namespace App\Themes;

use App\Contracts\Setting;
use App\Contracts\ThemeActivator;
use Illuminate\Container\Container;
use Throwable;

class DatabaseActivator implements ThemeActivator
{
    /**
     * Setting key that stores the active theme name.
     */
    protected string $key;

    protected Setting $setting;

    public function __construct(Container $app)
    {
        $this->setting = $app[Setting::class];
        $this->key = $app['config']->get('themes.activators.database.key', 'theme');
    }

    public function enable(Theme $theme): void
    {
        $this->setActive($theme, true);
    }

    public function disable(Theme $theme): void
    {
        $this->setActive($theme, false);
    }

    public function hasStatus(Theme|string $theme, bool $status): bool
    {
        $name = $theme instanceof Theme ? $theme->getName() : $theme;

        $isActive = strtolower((string) $this->activeTheme()) === strtolower($name);

        return $isActive === $status;
    }

    public function setActive(Theme $theme, bool $active): void
    {
        $this->setActiveByName($theme->getName(), $active);
    }

    public function setActiveByName(string $name, bool $status): void
    {
        if ($status === true) {
            $this->writeActiveTheme($name);

            return;
        }

        if ($this->hasStatus($name, true)) {
            $this->writeActiveTheme(null);
        }
    }

    public function delete(Theme $theme): void
    {
        if ($this->hasStatus($theme, true)) {
            $this->writeActiveTheme(null);
        }
    }

    public function reset(): void
    {
        $this->writeActiveTheme(null);
    }

    /**
     * Get the name of the active theme.
     */
    public function activeTheme(): ?string
    {
        try {
            $value = $this->setting->get($this->key);
        } catch (Throwable) {
            return null;
        }

        return is_string($value) && $value !== '' ? $value : null;
    }

    protected function writeActiveTheme(?string $name): void
    {
        $this->setting->set($this->key, $name);
    }
}
