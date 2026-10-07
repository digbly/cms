<?php

namespace App\Support\Entities;

use App\Support\ThemeSettingsRegistry;
use Illuminate\Contracts\Support\Arrayable;

class ThemeSetting implements Arrayable
{
    protected string $label;

    protected string $type = 'string';

    protected string|null|bool|array $default = null;

    protected bool $showApi = true;

    protected bool $added = false;

    public function __construct(
        protected string $key
    ) {
        $this->label = $key;
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function type(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function showApi(bool $show): static
    {
        $this->showApi = $show;

        return $this;
    }

    public function disableShowApi(): static
    {
        return $this->showApi(false);
    }

    public function default(string|null|bool|array $value): static
    {
        $this->default = $value;

        return $this;
    }

    public function add(): void
    {
        $this->added = true;

        ThemeSettingsRegistry::add($this->key, $this->toArray());
    }

    public function withAdded(bool $added): static
    {
        $this->added = $added;

        return $this;
    }

    public function toArray(): array
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'show_api' => $this->showApi,
            'default' => $this->default,
            'type' => $this->type,
        ];
    }

    public function __destruct()
    {
        if (! $this->added) {
            $this->add();
        }
    }
}
