<?php

namespace App\Contracts;

use App\Themes\DatabaseActivator;
use App\Themes\FileActivator;
use App\Themes\Theme;

/**
 * @see FileActivator
 * @see DatabaseActivator
 */
interface ThemeActivator
{
    public function enable(Theme $theme): void;

    public function disable(Theme $theme): void;

    public function hasStatus(Theme|string $theme, bool $status): bool;

    public function setActive(Theme $theme, bool $active): void;

    public function setActiveByName(string $name, bool $active): void;

    public function delete(Theme $theme): void;

    public function reset(): void;
}
