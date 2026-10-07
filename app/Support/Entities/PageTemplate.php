<?php

namespace App\Support\Entities;

use Illuminate\Support\Str;

class PageTemplate
{
    public string $label;

    /**
     * @var array<string, string>
     */
    public array $blocks = [];

    public function __construct(public string $key, protected array $options = [])
    {
        $this->label = $options['label'] ?? Str::headline($key);
        $this->blocks = $options['blocks'] ?? [];
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->{$key} ?? $default;
    }
}
