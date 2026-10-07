<?php

namespace App\Support;

use App\Contracts\Widget as WidgetContract;
use App\Models\ThemeSidebar;
use App\Support\Entities\Widget;
use Illuminate\Support\Collection;

class SidebarRenderer
{
    public function __construct(protected WidgetContract $widgets) {}

    /**
     * Render the widgets attached to a sidebar as HTML for Blade themes.
     *
     * When nothing has been configured yet, every widget registered for the
     * sidebar is rendered with its default settings so the theme keeps working
     * out of the box.
     *
     * @return array<int, array{key: string, label: string, html: string}>
     */
    public function render(string $sidebar, ?string $theme = null): array
    {
        return $this->ordered($sidebar, $theme)
            ->filter(fn (array $item) => $item['widget']->view !== null)
            ->map(fn (array $item) => [
                'key' => $item['widget']->getKey(),
                'label' => $item['sidebar']->label ?: $item['widget']->label,
                'html' => $item['widget']->render($item['sidebar'])->render(),
            ])
            ->values()
            ->all();
    }

    /**
     * Resolve the widgets attached to a sidebar into frontend data instead of
     * rendered HTML, for Inertia powered themes.
     *
     * @return array<int, array{key: string, label: string, component: string|null, data: array<string, mixed>}>
     */
    public function payload(string $sidebar, ?string $theme = null): array
    {
        return $this->ordered($sidebar, $theme)
            ->filter(fn (array $item) => $item['widget']->component !== null)
            ->map(fn (array $item) => $item['widget']->resolve($item['sidebar']))
            ->values()
            ->all();
    }

    /**
     * The configured widgets for a sidebar (or the theme defaults when none are
     * configured), paired with their registered widget definition.
     *
     * @return Collection<int, array{sidebar: ThemeSidebar, widget: Widget}>
     */
    protected function ordered(string $sidebar, ?string $theme): Collection
    {
        $items = $this->configured($sidebar, $theme ?? theme_name());

        if ($items->isEmpty()) {
            $items = $this->defaults($sidebar);
        }

        return $items
            ->map(function (ThemeSidebar $item): ?array {
                $widget = $this->widgets->get($item->widget);

                return $widget === null ? null : ['sidebar' => $item, 'widget' => $widget];
            })
            ->filter()
            ->values();
    }

    /**
     * @return Collection<int, ThemeSidebar>
     */
    protected function configured(string $sidebar, ?string $theme): Collection
    {
        return ThemeSidebar::query()
            ->whereSidebar($sidebar)
            ->when(
                $theme !== null,
                fn ($query) => $query->where(
                    fn ($query) => $query->where('theme', $theme)->orWhereNull('theme')
                )
            )
            ->with('translations')
            ->ordered()
            ->get();
    }

    /**
     * @return Collection<int, ThemeSidebar>
     */
    protected function defaults(string $sidebar): Collection
    {
        return $this->widgets->all()
            ->filter(fn (Widget $widget) => $widget->supports($sidebar)
                && ($widget->view !== null || $widget->component !== null))
            ->map(function (Widget $widget) use ($sidebar) {
                $item = new ThemeSidebar([
                    'widget' => $widget->getKey(),
                    'sidebar' => $sidebar,
                    'data' => $widget->defaults,
                ]);
                $item->label = $widget->label;

                return $item;
            });
    }
}
