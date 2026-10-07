<?php

namespace App\Contracts;

use App\Support\Entities\PageBlock as PageBlockEntity;
use Illuminate\Support\Collection;

interface PageBlock
{
    public function make(string $key, callable $callback): void;

    public function get(string $key): ?PageBlockEntity;

    public function all(): Collection;
}
