<?php

namespace Modules\Admin\Actions\Widget;

use App\Facades\Widget;
use App\Models\ThemeSidebar;
use Illuminate\Support\Facades\DB;

/**
 * Sync the ordered widgets attached to a sidebar: update or create the entries
 * the builder kept, then delete the ones it dropped.
 *
 * Unknown widgets and widgets that do not support the sidebar are ignored, so
 * callers (standalone widget screen, customizer) can pass raw input safely.
 */
class UpdateSidebarWidgets
{
    /**
     * @param  array<int, array<string, mixed>>  $contents
     */
    public function handle(string $sidebar, array $contents, string $locale, ?string $theme): void
    {
        DB::transaction(function () use ($sidebar, $contents, $locale, $theme): void {
            $order = 1;
            $keptIds = [];

            foreach ($contents as $content) {
                if (! is_array($content) || empty($content['widget'])) {
                    continue;
                }

                $widgetKey = $content['widget'];
                $widget = Widget::get($widgetKey);

                if ($widget === null || ! $widget->supports($sidebar)) {
                    continue;
                }

                $attributes = [
                    'sidebar' => $sidebar,
                    'widget' => $widgetKey,
                    'data' => $content['data'] ?? [],
                    'theme' => $theme,
                    'display_order' => $order,
                ];

                $existing = ! empty($content['id'])
                    ? ThemeSidebar::query()
                        ->where('sidebar', $sidebar)
                        ->where(fn ($query) => $query->where('theme', $theme)->orWhereNull('theme'))
                        ->find($content['id'])
                    : null;

                if ($existing !== null) {
                    $existing->fill($attributes)->save();
                    $item = $existing;
                } else {
                    $item = ThemeSidebar::query()->create($attributes);
                }

                $item->translateOrNew($locale)->label = $content['label'] ?? $widget->label;
                $item->save();

                $keptIds[] = $item->id;
                $order++;
            }

            ThemeSidebar::query()
                ->whereSidebar($sidebar)
                ->where(fn ($query) => $query->where('theme', $theme)->orWhereNull('theme'))
                ->whereNotIn('id', $keptIds)
                ->delete();
        });
    }
}
