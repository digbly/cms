<?php

namespace App\Support;

use App\Contracts\Widget as WidgetContract;
use App\Support\Entities\Widget as WidgetEntity;
use Illuminate\Support\Collection;

class WidgetRepository implements WidgetContract
{
    /**
     * @var array<string, callable>
     */
    protected array $widgets = [];

    public function make(string $key, callable $callback): void
    {
        $this->widgets[$key] = $callback;
    }

    public function get(string $key): ?WidgetEntity
    {
        if (! isset($this->widgets[$key])) {
            return null;
        }

        return new WidgetEntity($key, ($this->widgets[$key])());
    }

    public function all(): Collection
    {
        return collect($this->widgets)->map(
            fn (callable $callback, string $key) => new WidgetEntity($key, $callback())
        )->values();
    }
}
