<?php

namespace App\Support;

use App\Contracts\AdminTranslation;

class AdminTranslationRepository implements AdminTranslation
{
    /**
     * @var array<string, callable>
     */
    protected array $translations = [];

    public function make(string $namespace, callable $callback): void
    {
        $this->translations[$namespace] = $callback;
    }

    public function get(string $namespace): ?array
    {
        if (! isset($this->translations[$namespace])) {
            return null;
        }

        return ($this->translations[$namespace])();
    }

    public function all(): array
    {
        return collect($this->translations)
            ->map(fn (callable $callback): array => $callback())
            ->all();
    }
}
