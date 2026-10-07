<?php

namespace App\Support;

use App\Contracts\MenuBox as MenuBoxContract;
use Illuminate\Support\Collection;

class MenuBoxRepository implements MenuBoxContract
{
    protected array $boxes = [];

    public function make(string $key, string $class, callable $options): void
    {
        $this->boxes[$key] = [
            'class' => $class,
            'options' => $options,
        ];
    }

    public function get(string $position): array
    {
        return $this->boxes[$position] ?? [];
    }

    public function all(): Collection
    {
        return collect($this->boxes)->sort(
            fn ($a, $b) => ($a['options']()['priority'] ?? 99) <=> ($b['options']()['priority'] ?? 99)
        );
    }
}
