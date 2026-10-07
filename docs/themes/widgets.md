# Themes — Widgets

A theme registers the sidebars widgets can be placed in and the widgets
themselves, then renders them.

## Register sidebars & widgets (backend)

Register a theme's sidebars and widgets from the theme service provider's
`boot()`:

```php
use App\Facades\Sidebar;
use App\Facades\Widget;
use App\Models\ThemeSidebar;

protected function registerSidebars(): void
{
    Sidebar::make('sidebar', fn () => [
        'label' => __('default::messages.sidebar_main'),
        'description' => __('default::messages.sidebar_main_description'),
    ]);
}

protected function registerWidgets(): void
{
    Widget::make('recent-posts', fn () => [
        'label' => __('default::messages.widget_recent_posts'),
        'component' => 'Widgets/RecentPosts',
        'only' => ['sidebar'],
        'defaults' => ['limit' => 5],
        'data' => fn (ThemeSidebar $sidebar, array $data): array => [
            'posts' => $this->presentPosts(
                app(SidebarData::class)->recent((int) ($data['limit'] ?? 5))
            ),
        ],
    ]);
}
```

`only` constrains a widget to the sidebars where it makes sense (empty = any).
Register them from the theme provider so an inactive theme contributes nothing.
The bundled `default` theme ships `Widgets/Categories`, `Widgets/RecentPosts`
and `Widgets/PopularPosts` this way.

## Render widgets

Inertia themes receive a JSON payload resolved by `SidebarRenderer::payload()`
and render each item by its `component` key:

```tsx
// themes/<theme>/resources/views/components/WidgetRenderer.tsx
switch (widget.component) {
    case 'Widgets/RecentPosts':
        return <RecentPosts {...widget.data} />;
    default:
        return null;
}
```

The backend registries (`Widget`, `Sidebar`, `ThemeSidebar`) and the renderer
contract are documented in [Widgets & Sidebars](../the-basics/widgets.md).

## See also

- [Widgets & Sidebars](../the-basics/widgets.md)
- [Templates & Blocks](templates.md)
