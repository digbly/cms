<?php

namespace App\Contracts;

use App\Support\Entities\PageTemplate as PageTemplateEntity;
use Illuminate\Support\Collection;

interface PageTemplate
{
    public function make(string $key, callable $callback): void;

    public function get(string $key): ?PageTemplateEntity;

    public function all(): Collection;
}
