<?php

namespace Modules\Admin\Actions\Menu;

use App\Facades\Setting;
use App\Models\Menus\Menu;

/**
 * Assign a menu to the given theme locations, detaching it from the locations
 * it no longer belongs to.
 */
class SyncMenuLocations
{
    /**
     * @param  array<int, string>  $locations
     */
    public function handle(Menu $menu, array $locations): void
    {
        $config = (array) Setting::get('nav_location', []);

        foreach ($config as $key => $menuId) {
            if ((string) $menuId === (string) $menu->getKey()) {
                unset($config[$key]);
            }
        }

        foreach ($locations as $location) {
            $config[$location] = $menu->getKey();
        }

        Setting::set('nav_location', $config);
    }
}
