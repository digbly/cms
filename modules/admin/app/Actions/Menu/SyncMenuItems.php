<?php

namespace Modules\Admin\Actions\Menu;

use App\Facades\MenuBox;
use App\Models\Menus\Menu;
use Illuminate\Support\Arr;

/**
 * Persist a menu item tree coming from the builder.
 *
 * Items are matched by id when present (update) or created otherwise. Returns
 * the ids it kept so the caller can delete the items that were removed.
 */
class SyncMenuItems
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, string>
     */
    public function handle(Menu $menu, array $items, string $locale): array
    {
        return $this->sync($menu, $items, 1, $locale);
    }

    /**
     * @param  array<int, array<string, mixed>>  $items
     * @return array<int, string>
     */
    protected function sync(
        Menu $menu,
        array $items,
        int $index,
        string $locale,
        ?string $parentId = null
    ): array {
        $keptIds = [];

        foreach ($items as $item) {
            $attributes = [
                'parent_id' => $parentId,
                'display_order' => $index,
                'target' => $item['target'] ?? '_self',
            ];

            if (isset($item['key'])) {
                $box = MenuBox::get($item['key']);

                $attributes['menuable_type'] = $box['class'] ?? ($item['menuable_type'] ?? null);
                $attributes['menuable_id'] = $item['menuable_id'] ?? null;
                $attributes['box_key'] = $item['key'];
            } else {
                $attributes['is_home'] = $item['is_home'] ?? 0;
                $attributes['link'] = $item['link'] ?? null;
                $attributes['box_key'] = 'custom';
            }

            $newItem = $menu->items()->updateOrCreate(
                ['id' => $item['id'] ?? null],
                $attributes
            );

            $newItem->translateOrNew($locale)->label = $item['label'] ?? '';
            $newItem->save();

            $keptIds[] = $newItem->id;

            if ($children = Arr::get($item, 'children')) {
                $keptIds = array_merge(
                    $keptIds,
                    $this->sync($menu, $children, 1, $locale, $newItem->id)
                );
            }

            $index++;
        }

        return $keptIds;
    }
}
