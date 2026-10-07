<?php

namespace App\Contracts;

use Illuminate\Support\Collection;

interface NavMenu
{
    public function make(string $key, callable $callback): void;

    public function get(string $key): ?array;

    public function all(): Collection;
}
