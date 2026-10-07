<?php

namespace App\Support\Entities;

use Illuminate\Support\Str;

class Sidebar
{
    public string $label;

    public ?string $description = null;

    public function __construct(protected string $key, protected array $options = [])
    {
        $this->label = $options['label'] ?? Str::headline($key);
        $this->description = $options['description'] ?? null;
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->{$key} ?? $default;
    }
}
