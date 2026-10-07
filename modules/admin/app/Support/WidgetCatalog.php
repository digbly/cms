<?php

namespace Modules\Admin\Support;

use App\Facades\Sidebar;
use App\Facades\Widget;
use App\Models\ThemeSidebar;
use Modules\Admin\Http\Resources\SidebarResource;
use Modules\Admin\Http\Resources\SidebarWidgetResource;
use Modules\Admin\Http\Resources\WidgetResource;

/**
 * Read model for the widget manager: the widgets available for the active
 * theme, the sidebars they can be attached to, and the current assignments.
 */
class WidgetCatalog
{
    /**
     * @return array{
     *     widgets: array<int, array<string, mixed>>,
     *     sidebars: array<int, array<string, mixed>>,
     *     sidebar_widgets: array<string, array<int, array<string, mixed>>>,
     *     locale: string,
     *     theme: string|null
     * }
     */
    public function payload(): array
    {
        $sidebars = Sidebar::all()
            ->map(fn ($sidebar) => [
                'key' => $sidebar->getKey(),
                'label' => $sidebar->label,
                'description' => $sidebar->description,
            ])
            ->values();

        $widgets = Widget::all()
            ->map(fn ($widget) => [
                'key' => $widget->getKey(),
                'label' => $widget->label,
                'description' => $widget->description,
                'only' => $widget->only,
            ])
            ->values();

        $items = ThemeSidebar::query()
            ->with('translations')
            ->ordered()
            ->get();

        $sidebarWidgets = $sidebars->mapWithKeys(function (array $sidebar) use ($items) {
            $group = $items
                ->where('sidebar', $sidebar['key'])
                ->values()
                ->map(fn (ThemeSidebar $item) => SidebarWidgetResource::make($item)->resolve())
                ->all();

            return [$sidebar['key'] => $group];
        });

        return [
            'widgets' => WidgetResource::collection($widgets)->resolve(),
            'sidebars' => SidebarResource::collection($sidebars)->resolve(),
            'sidebar_widgets' => $sidebarWidgets->all(),
            'locale' => app()->getLocale(),
            'theme' => theme_name(),
        ];
    }
}
