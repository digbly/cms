<?php

namespace Modules\Admin\Actions\Menu;

use App\Models\Menus\Menu;
use Illuminate\Support\Facades\DB;

/**
 * Apply a menu edit coming from the builder: rename it, sync its item tree,
 * drop the removed items and (optionally) re-assign its theme locations.
 */
class UpdateMenu
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     * @param  array<int, string>|null  $locations  Null leaves the assignments untouched.
     */
    public function handle(
        Menu $menu,
        string $name,
        array $items,
        string $locale,
        ?array $locations = null
    ): void {
        DB::transaction(function () use ($menu, $name, $items, $locale, $locations): void {
            $menu->update(['name' => $name]);

            $keptIds = app(SyncMenuItems::class)->handle($menu, $items, $locale);

            $menu->items()
                ->where(
                    fn ($query) => $query->whereNotIn('id', $keptIds)
                        ->orWhereColumn('id', 'parent_id')
                )
                ->delete();

            if ($locations !== null) {
                app(SyncMenuLocations::class)->handle($menu, $locations);
            }
        });
    }
}
