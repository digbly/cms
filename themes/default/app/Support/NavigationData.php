<?php

namespace Themes\Default\Support;

use App\Facades\Setting;
use App\Models\Menus\Menu;

class NavigationData
{
    /**
     * Resolve the menu assigned to a location into a nested, presentable tree.
     *
     * @return array<int, array<string, mixed>>
     */
    public function menu(string $location = 'primary'): array
    {
        $locations = (array) Setting::get('nav_location', []);
        $menuId = $locations[$location] ?? null;

        if (! is_string($menuId) || $menuId === '') {
            return [];
        }

        $menu = Menu::withDataItems()->find($menuId);

        if ($menu === null) {
            return [];
        }

        return MenuPresenter::items($menu->items);
    }
}
