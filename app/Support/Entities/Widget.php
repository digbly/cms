<?php

namespace App\Support\Entities;

use App\Models\ThemeSidebar;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;

class Widget
{
    public string $label;

    public ?string $description = null;

    public ?string $view = null;

    /**
     * Frontend component key used by Inertia themes to render the widget.
     */
    public ?string $component = null;

    /**
     * Sidebar keys this widget may be attached to. An empty list allows any.
     *
     * @var array<int, string>
     */
    public array $only = [];

    /**
     * Default settings used to render the widget before it is configured.
     *
     * @var array<string, mixed>
     */
    public array $defaults = [];

    /**
     * Optional resolver that turns the stored settings into frontend data.
     *
     * @var (Closure(ThemeSidebar, array<string, mixed>): array<string, mixed>)|null
     */
    protected ?Closure $dataResolver = null;

    public function __construct(protected string $key, protected array $options = [])
    {
        $this->label = $options['label'] ?? Str::headline($key);
        $this->description = $options['description'] ?? null;
        $this->view = $options['view'] ?? null;
        $this->component = $options['component'] ?? null;
        $this->only = $options['only'] ?? [];
        $this->defaults = $options['defaults'] ?? [];
        $this->dataResolver = isset($options['data']) && $options['data'] instanceof Closure
            ? $options['data']
            : null;
    }

    public function getKey(): string
    {
        return $this->key;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->{$key} ?? $default;
    }

    public function supports(string $sidebar): bool
    {
        return $this->only === [] || in_array($sidebar, $this->only, true);
    }

    public function render(ThemeSidebar $sidebar): View|string
    {
        if ($this->view === null) {
            return '';
        }

        return view($this->view, [
            'widget' => $this,
            'sidebar' => $sidebar,
            'data' => $sidebar->data ?? [],
        ]);
    }

    /**
     * Resolve the widget into the payload an Inertia frontend consumes.
     *
     * @return array{key: string, label: string, component: string|null, data: array<string, mixed>}
     */
    public function resolve(ThemeSidebar $sidebar): array
    {
        $configured = is_array($sidebar->data) ? $sidebar->data : [];
        $data = array_merge($this->defaults, $configured);

        if ($this->dataResolver !== null) {
            $data = array_merge($data, ($this->dataResolver)($sidebar, $data));
        }

        return [
            'key' => $this->key,
            'label' => $sidebar->label ?: $this->label,
            'component' => $this->component,
            'data' => $data,
        ];
    }
}
