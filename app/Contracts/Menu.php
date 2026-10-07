<?php

namespace App\Contracts;

use Illuminate\Support\Collection;

interface Menu
{
    public function make(string $key, callable $callback): void;

    public function get(string $key): ?array;

    public function getByPosition(string $position): Collection;

    public function tree(string $position): Collection;

    public function all(): Collection;
}
