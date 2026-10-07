<?php

namespace Modules\Admin\Support;

use App\Facades\MenuBox;
use App\Facades\NavMenu;
use App\Facades\Setting;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;

/**
 * Read model for the menu builder: the content sources ("boxes") a menu can
 * pull items from, the theme locations a menu can be assigned to, and the
 * items available inside a single box.
 */
class MenuCatalog
{
    /**
     * @return array<int, array{key: string, label: string}>
     */
    public function boxes(): array
    {
        return MenuBox::all()
            ->map(fn (array $box, string $key) => [
                'key' => $key,
                'label' => $box['options']()['label'] ?? ucfirst($key),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array{data: array<int, array{key: string, label: string}>, selected: array<string, string>}
     */
    public function locations(): array
    {
        return [
            'data' => NavMenu::all()
                ->map(fn (array $nav, string $key) => [
                    'key' => $key,
                    'label' => $nav['label'] ?? ucfirst($key),
                ])
                ->values()
                ->all(),
            'selected' => (array) Setting::get('nav_location', []),
        ];
    }

    /**
     * @return array<int, array{id: string, text: string, menuable_class: string, menuable_class_name: string}>
     */
    public function boxItems(string $box, string $search = ''): array
    {
        $definition = MenuBox::get($box);
        $class = $definition['class'] ?? null;

        if (! $class || ! class_exists($class)) {
            return [];
        }

        $field = $definition['options']()['field'] ?? 'name';
        $translatable = (new $class) instanceof TranslatableContract;

        $query = $class::query()->latest();

        if ($translatable) {
            $query->with('translations');

            if ($search !== '') {
                $query->whereHas(
                    'translations',
                    fn ($builder) => $builder->where($field, 'like', "%{$search}%")
                );
            }
        } elseif ($search !== '') {
            $query->where($field, 'like', "%{$search}%");
        }

        return $query->limit(20)->get()->map(fn ($item) => [
            'id' => (string) $item->getKey(),
            'text' => (string) $item->{$field},
            'menuable_class' => get_class($item),
            'menuable_class_name' => class_basename($item),
        ])->all();
    }
}
