<?php

namespace App\Modules;

use App\Contracts\Setting;
use Illuminate\Container\Container;
use Nwidart\Modules\Contracts\ActivatorInterface;
use Nwidart\Modules\Module;
use Throwable;

class DatabaseActivator implements ActivatorInterface
{
    /**
     * Setting key that stores the enabled module names as JSON.
     */
    protected string $key;

    protected Setting $setting;

    public function __construct(Container $app)
    {
        $this->setting = $app[Setting::class];
        $this->key = $app['config']->get('modules.activators.database.key', 'plugin_statuses');
    }

    public function enable(Module $module): void
    {
        $this->setActiveByName($module->getName(), true);
    }

    public function disable(Module $module): void
    {
        $this->setActiveByName($module->getName(), false);
    }

    public function hasStatus(Module|string $module, bool $status): bool
    {
        $name = $module instanceof Module ? $module->getName() : $module;

        return (bool) ($this->getModulesStatuses()[$name] ?? false) === $status;
    }

    public function setActive(Module $module, bool $active): void
    {
        $this->setActiveByName($module->getName(), $active);
    }

    public function setActiveByName(string $name, bool $status): void
    {
        $statuses = $this->getModulesStatuses();

        if ($status) {
            $statuses[$name] = true;
        } else {
            unset($statuses[$name]);
        }

        $this->writeStatuses($statuses);
    }

    public function delete(Module $module): void
    {
        $statuses = $this->getModulesStatuses();

        unset($statuses[$module->getName()]);

        $this->writeStatuses($statuses);
    }

    public function reset(): void
    {
        $this->writeStatuses([]);
    }

    /**
     * Get the enabled module statuses from the settings.
     */
    public function getModulesStatuses(): array
    {
        try {
            $statuses = $this->setting->get($this->key);
        } catch (Throwable) {
            return [];
        }

        return is_array($statuses) ? $statuses : [];
    }

    protected function writeStatuses(array $statuses): void
    {
        $this->setting->set($this->key, $statuses);
    }
}
