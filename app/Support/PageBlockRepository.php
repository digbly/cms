<?php

namespace App\Support;

use App\Contracts\PageBlock as PageBlockContract;
use App\Support\Entities\PageBlock as PageBlockEntity;
use Illuminate\Support\Collection;

class PageBlockRepository implements PageBlockContract
{
    /**
     * @var array<string, callable>
     */
    protected array $blocks = [];

    public function make(string $key, callable $callback): void
    {
        $this->blocks[$key] = $callback;
    }

    public function get(string $key): ?PageBlockEntity
    {
        if (! isset($this->blocks[$key])) {
            return null;
        }

        return new PageBlockEntity($key, ($this->blocks[$key])());
    }

    public function all(): Collection
    {
        return collect($this->blocks)->map(
            fn (callable $callback, string $key) => new PageBlockEntity($key, $callback())
        );
    }
}
