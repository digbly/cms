<?php

namespace App\Contracts;

use App\Support\Entities\Sidebar as SidebarEntity;
use Illuminate\Support\Collection;

interface Sidebar
{
    public function make(string $key, callable $callback): void;

    public function get(string $key): ?SidebarEntity;

    public function all(): Collection;
}
