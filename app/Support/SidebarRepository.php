<?php

namespace App\Support;

use App\Contracts\Sidebar as SidebarContract;
use App\Support\Entities\Sidebar as SidebarEntity;
use Illuminate\Support\Collection;

class SidebarRepository implements SidebarContract
{
    /**
     * @var array<string, callable>
     */
    protected array $sidebars = [];

    public function make(string $key, callable $callback): void
    {
        $this->sidebars[$key] = $callback;
    }

    public function get(string $key): ?SidebarEntity
    {
        if (! isset($this->sidebars[$key])) {
            return null;
        }

        return new SidebarEntity($key, ($this->sidebars[$key])());
    }

    public function all(): Collection
    {
        return collect($this->sidebars)->map(
            fn (callable $callback, string $key) => new SidebarEntity($key, $callback())
        )->values();
    }
}
