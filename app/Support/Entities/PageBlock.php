<?php

namespace App\Support\Entities;

use App\Models\Pages\PageBlock as PageBlockModel;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;

class PageBlock
{
    public string $label;

    public ?string $form = null;

    public ?string $view = null;

    /**
     * Frontend component key used by Inertia themes to render the block.
     */
    public ?string $component = null;

    /**
     * Optional resolver that turns the stored settings into frontend data.
     *
     * @var (Closure(PageBlockModel, array<string, mixed>): array<string, mixed>)|null
     */
    protected ?Closure $dataResolver = null;

    public function __construct(public string $key, protected array $options = [])
    {
        $this->label = $options['label'] ?? Str::headline($key);
        $this->form = $options['form'] ?? null;
        $this->view = $options['view'] ?? null;
        $this->component = $options['component'] ?? null;
        $this->dataResolver = isset($options['data']) && $options['data'] instanceof Closure
            ? $options['data']
            : null;
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->{$key} ?? $default;
    }

    public function form(array $data = []): ?View
    {
        if ($this->form === null || ! view()->exists($this->form)) {
            return null;
        }

        return view($this->form, [
            'name' => $data['name'] ?? null,
            'data' => $data,
        ]);
    }

    public function view(PageBlockModel $block): ?View
    {
        if ($this->view === null || ! view()->exists($this->view)) {
            return null;
        }

        return view($this->view, ['block' => $block]);
    }

    /**
     * Resolve the block into the payload an Inertia frontend consumes.
     *
     * @return array{key: string, label: string, component: string|null, data: array<string, mixed>}
     */
    public function resolve(PageBlockModel $block): array
    {
        $data = is_array($block->data) ? $block->data : [];

        if ($this->dataResolver !== null) {
            $data = array_merge($data, ($this->dataResolver)($block, $data));
        }

        return [
            'key' => $this->key,
            'label' => $block->label ?: $this->label,
            'component' => $this->component,
            'data' => $data,
        ];
    }
}
