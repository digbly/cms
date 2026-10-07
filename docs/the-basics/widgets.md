# Widgets & Sidebars

Widgets are reusable frontend fragments a theme can place into named
containers. A **sidebar** is such a container (registered per theme); a
**widget** is the fragment. The admin lets editors attach, order and configure
widgets per sidebar, and the theme renders them either as Blade HTML or as an
Inertia payload.

## Register a sidebar

```php
use App\Facades\Sidebar;

Sidebar::make('sidebar', fn () => [
    'label' => __('default::messages.sidebar_main'),
    'description' => __('default::messages.sidebar_main_description'),
]);
```

`App\Support\SidebarRepository` returns `App\Support\Entities\Sidebar` objects
(`getKey()`, `label`, `description`).

## Register a widget

```php
use App\Facades\Widget;
use App\Models\ThemeSidebar;

Widget::make('recent-posts', fn () => [
    'label' => __('default::messages.widget_recent_posts'),
    'description' => __('default::messages.widget_recent_posts_description'),
    'component' => 'Widgets/RecentPosts',        // Inertia component key
    'only' => ['sidebar'],                       // allowed sidebar keys ([] = any)
    'defaults' => ['limit' => 5],
    'data' => fn (ThemeSidebar $sidebar, array $data): array => [
        'posts' => $this->presentPosts(
            app(SidebarData::class)->recent((int) ($data['limit'] ?? 5))
        ),
    ],
]);
```

`App\Support\Entities\Widget` options:

| Option | Description |
| --- | --- |
| `label` / `description` | Shown in the admin. |
| `view` | Blade view rendered for HTML themes. |
| `component` | Inertia component key rendered client-side. |
| `only` | Sidebar keys the widget may attach to (empty = all). |
| `defaults` | Default settings merged before stored data. |
| `data` | Resolver `(ThemeSidebar $sidebar, array $data) => array` merged into the payload. |

A widget may ship a `view`, a `component`, or both.

## Storage

Configured widgets live in `theme_sidebars` (`App\Models\ThemeSidebar`): one row
per placed widget with `widget`, `sidebar`, `data` (cast to array), `theme`,
`display_order` and translatable `label`/`fields`. This is why `ThemeSidebar`
requires the matching `ThemeSidebarTranslation` model.

## Rendering

`App\Support\SidebarRenderer` resolves a sidebar. When nothing is configured yet
it falls back to every widget registered for that sidebar so a fresh install
still renders.

- **Blade/HTML themes** — `render($sidebar)` returns
  `[{ key, label, html }, ...]`, calling `Widget::render()` for widgets with a
  `view`.

```php
$blocks = app(SidebarRenderer::class)->render('sidebar');
```

- **Inertia themes** — `payload($sidebar)` returns
  `[{ key, label, component, data }, ...]` via `Widget::resolve()`. The `data`
  resolver merges the stored settings over `defaults`.

```php
$widgets = app(SidebarRenderer::class)->payload('sidebar');
// passed to Inertia; rendered by the theme's WidgetRenderer component
```

Widget resolution order is: stored config for the active theme → theme defaults
→ widgets registered for the sidebar with their `defaults`.

## Admin integration

`Modules\Admin\Http\Controllers\Web\WidgetController` renders
`Admin::widgets/Index` from `Modules\Admin\Support\WidgetCatalog` (sidebars,
widgets and the current assignments). Saving calls
`Modules\Admin\Actions\Widget\UpdateSidebarWidgets`, which writes the
`theme_sidebars` rows for the sidebar and active theme.

## Frontend contract

An Inertia theme renders a payload item by switching on its `component` key:

```tsx
// themes/<theme>/resources/views/components/WidgetRenderer.tsx
switch (widget.component) {
    case 'Widgets/RecentPosts':
        return <RecentPosts {...widget.data} />;
    default:
        return null;
}
```

The bundled `default` theme ships `Widgets/Categories`, `Widgets/RecentPosts`
and `Widgets/PopularPosts`.

## Conventions

- Register sidebars and widgets from the theme service provider so an inactive
  theme contributes nothing.
- Use `only` to constrain a widget to the sidebars where it makes sense.
- Put query/DTO logic in the `data` resolver, not in the React component, so the
  payload is serialisable for SSR.
- Keep the frontend `component` key in sync with the theme's `WidgetRenderer`.
