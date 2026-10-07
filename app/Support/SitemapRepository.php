<?php

namespace App\Support;

use App\Contracts\Sitemap;
use Illuminate\Support\Collection;

class SitemapRepository implements Sitemap
{
    protected array $providers = [];

    public function register(string $key, string $class): void
    {
        $this->providers[$key] = $class;
    }

    public function all(): Collection
    {
        return new Collection($this->providers);
    }

    public function get(string $key): ?string
    {
        return $this->providers[$key] ?? null;
    }
}
