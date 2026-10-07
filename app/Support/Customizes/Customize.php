<?php

namespace App\Support\Customizes;

use Illuminate\Support\Collection;

/**
 * Mutable collection of the customizer panels, sections and controls.
 *
 * Themes build a Customize instance through the {@see CustomizeRegistry}
 * (exposed by the {@see \App\Facades\Customize} facade) and the admin
 * customizer controller serialises it for the SPA.
 */
class Customize
{
    protected Collection $panels;

    protected Collection $settings;

    protected Collection $sections;

    protected Collection $controls;

    public function __construct()
    {
        $this->panels = new Collection;
        $this->settings = new Collection;
        $this->sections = new Collection;
        $this->controls = new Collection;
    }

    public function addPanel(string $key, array $args = []): void
    {
        $args['key'] = $key;

        $this->panels->put($key, new Collection($args));
    }

    public function getPanel(?string $key = null): Collection
    {
        if (empty($key)) {
            return $this->panels;
        }

        return $this->panels->get($key);
    }

    public function removePanel(string $key): void
    {
        $this->panels->forget($key);
    }

    public function addSection(string $key, array $args = []): void
    {
        $args['key'] = $key;

        $this->sections->put($key, new Collection($args));
    }

    public function getSection(?string $key = null): Collection
    {
        if (empty($key)) {
            return $this->sections;
        }

        return $this->sections->get($key);
    }

    public function removeSection(string $key): void
    {
        $this->sections->forget($key);
    }

    public function addSetting(string $key, array $args = []): void
    {
        $args['key'] = $key;

        $this->settings->put($key, new Collection($args));
    }

    public function getSetting(?string $key = null): Collection
    {
        if (empty($key)) {
            return $this->settings;
        }

        return $this->settings->get($key);
    }

    public function removeSetting(string $key): void
    {
        $this->settings->forget($key);
    }

    public function addControl(CustomizeControl $control): void
    {
        $key = $control->getKey();
        $args = $control->getArgs();
        $args['key'] = $key;

        $this->controls->put($key, $args);
    }

    public function getControl(?string $key = null): Collection
    {
        if (empty($key)) {
            return $this->controls;
        }

        return $this->controls->get($key);
    }

    public function removeControl(string $key): void
    {
        $this->controls->forget($key);
    }
}
