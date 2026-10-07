<?php

namespace Themes\Default\Support;

use App\Models\Menus\MenuItem;
use Illuminate\Support\Collection;

/**
 * Flattens the nested, translated menu tree into the plain arrays the theme's
 * Inertia pages consume.
 */
class MenuPresenter
{
    /**
     * @param  Collection<int, MenuItem>  $items
     * @return array<int, array<string, mixed>>
     */
    public static function items(Collection $items): array
    {
        return $items
            ->sortBy('display_order')
            ->map(fn (MenuItem $item) => self::item($item))
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public static function item(MenuItem $item): array
    {
        $children = $item->relationLoaded('children') ? $item->children : collect();

        return [
            'id' => $item->getKey(),
            'label' => $item->label,
            'url' => $item->getUrl(),
            'icon' => $item->icon,
            'target' => $item->target,
            'children' => self::items($children),
        ];
    }
}
