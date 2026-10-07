<?php

namespace App\Support;

use App\Contracts\PageTemplate as PageTemplateContract;
use App\Support\Entities\PageTemplate as PageTemplateEntity;
use Illuminate\Support\Collection;

class PageTemplateRepository implements PageTemplateContract
{
    /**
     * @var array<string, callable>
     */
    protected array $templates = [];

    public function make(string $key, callable $callback): void
    {
        $this->templates[$key] = $callback;
    }

    public function get(string $key): ?PageTemplateEntity
    {
        if (! isset($this->templates[$key])) {
            return null;
        }

        return new PageTemplateEntity($key, ($this->templates[$key])());
    }

    public function all(): Collection
    {
        return collect($this->templates)->map(
            fn (callable $callback, string $key) => new PageTemplateEntity($key, $callback())
        );
    }
}
