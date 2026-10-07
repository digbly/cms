<?php

namespace App\Support;

use App\Contracts\Menu as MenuContract;
use Illuminate\Support\Collection;

class MenuRepository implements MenuContract
{
    /**
     * Position reserved for the admin SPA sidebar.
     */
    public const POSITION_ADMIN = 'admin';

    protected array $menus = [];

    public function make(string $key, callable $callback): void
    {
        $this->menus[$key] = $callback;
    }

    public function get(string $key): ?array
    {
        if (! isset($this->menus[$key])) {
            return null;
        }

        return ($this->menus[$key])();
    }

    public function getByPosition(string $position): Collection
    {
        return collect($this->menus)
            ->map(function ($callback, $key) {
                $data = $callback();

                if (! $data) {
                    return null;
                }

                $data['key'] = $key;
                $prefix = $data['prefix'] ?? config('app.admin_prefix', 'admin');

                if (! isset($data['url'])) {
                    $data['url'] = $key === 'dashboard'
                        ? url($prefix ?: '')
                        : url($prefix ? "{$prefix}/{$key}" : $key);
                } else {
                    $data['url'] = isset($data['prefix'])
                        ? url($data['prefix'].'/'.ltrim($data['url'], '/'))
                        : admin_url($data['url']);
                }

                $data['target'] ??= '_self';
                $data['icon'] ??= 'fa fa-circle';
                $data['priority'] ??= 20;
                $data['parent'] ??= null;
                $data['position'] ??= null;

                return $data;
            })
            ->filter()
            ->filter(
                fn ($menu) => ($menu['position'] ?? 'admin-left') === $position
            )
            ->values();
    }

    /**
     * Build a nested navigation tree for a given position.
     *
     * Items declare their container through the `parent` key (matching another
     * menu key). Only `key`, `label`, `to`, `icon`, `permission`, `parent` and
     * `priority` are exposed, making the result safe to serialise for the SPA.
     */
    public function tree(string $position): Collection
    {
        $items = collect($this->menus)
            ->map(function ($callback, $key) use ($position) {
                $data = $callback();

                if (! is_array($data) || ($data['position'] ?? 'admin-left') !== $position) {
                    return null;
                }

                return [
                    'key' => $key,
                    'label' => $data['label'] ?? $key,
                    'to' => $data['to'] ?? null,
                    'icon' => $data['icon'] ?? 'circle',
                    'permission' => $data['permission'] ?? null,
                    'parent' => $data['parent'] ?? null,
                    'priority' => $data['priority'] ?? 20,
                ];
            })
            ->filter()
            ->values();

        $keys = $items->pluck('key')->all();

        $isRoot = static fn (array $item): bool => $item['parent'] === null
            || ! in_array($item['parent'], $keys, true);

        $build = function (?string $parent) use (&$build, $items, $isRoot): Collection {
            return $items
                ->filter(static fn (array $item): bool => $parent === null
                    ? $isRoot($item)
                    : $item['parent'] === $parent)
                ->sortBy('priority')
                ->map(function (array $item) use (&$build): array {
                    $item['children'] = $build($item['key']);

                    return $item;
                })
                ->values();
        };

        return $build(null);
    }

    public function all(): Collection
    {
        return collect($this->menus)->map(
            fn ($callback) => $callback()
        );
    }
}
