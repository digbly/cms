<?php

namespace App\Support;

use App\Contracts\NavMenu as NavMenuContract;
use Illuminate\Support\Collection;

class NavMenuRepository implements NavMenuContract
{
    protected array $navMenus = [];

    public function make(string $key, callable $callback): void
    {
        $this->navMenus[$key] = $callback;
    }

    public function get(string $key): ?array
    {
        if (! isset($this->navMenus[$key])) {
            return null;
        }

        return ($this->navMenus[$key])();
    }

    public function all(): Collection
    {
        return collect($this->navMenus)->map(
            fn ($callback) => $callback()
        );
    }
}
