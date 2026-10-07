<?php

namespace App\Contracts;

use Illuminate\Support\Collection;

interface MenuBox
{
    public function make(string $key, string $class, callable $options): void;

    public function get(string $position): array;

    public function all(): Collection;
}
