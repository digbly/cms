<?php

namespace App\Support\Customizes;

use Illuminate\Support\Collection;

class CustomizeControl
{
    protected Collection $args;

    public function __construct(
        protected string $key,
        array $args = []
    ) {
        $this->args = collect($args);
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function getArgs(): Collection
    {
        return $this->args;
    }
}
