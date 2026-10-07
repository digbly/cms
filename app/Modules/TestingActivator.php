<?php

namespace App\Modules;

use Nwidart\Modules\Contracts\ActivatorInterface;
use Nwidart\Modules\Module;

class TestingActivator implements ActivatorInterface
{
    public function enable(Module $module): void
    {
        //
    }

    public function disable(Module $module): void
    {
        //
    }

    public function hasStatus(Module|string $module, bool $status): bool
    {
        return $status === true;
    }

    public function setActive(Module $module, bool $active): void
    {
        //
    }

    public function setActiveByName(string $name, bool $status): void
    {
        //
    }

    public function delete(Module $module): void
    {
        //
    }

    public function reset(): void
    {
        //
    }
}
