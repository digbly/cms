<?php

namespace App\Contracts;

use App\Support\Entities\Widget as WidgetEntity;
use Illuminate\Support\Collection;

interface Widget
{
    public function make(string $key, callable $callback): void;

    public function get(string $key): ?WidgetEntity;

    public function all(): Collection;
}
