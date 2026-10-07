# Navigation Menus

Navigation menus are the **content** menus edited in the admin (Header, Footer,
...) — not the admin sidebar (see [Admin Menus](menus.md)). A menu is a named
collection of `MenuItem` rows that can point at a route, a custom URL, or any
model registered as a menu content source ("box"), and is assigned to a theme
location.

## Conceptual model

```
NavMenu location  (registered in code: primary, footer, ...)
        ▲
        │ assigned via setting `nav_location`
        │
Menu ───┴── MenuItem (tree: parent_id, display_order)
                 │ morphTo menuable (Post, Category, ...)
                 └── MenuBox (registered content source defining the model)
```

- **`App\Models\Menus\Menu`** — a named menu (`name`), with `items()`.
- **`App\Models\Menus\MenuItem`** — a translatable node with `link`, `icon`,
  `target`, `display_order`, `box_key`, `is_home`, an optional polymorphic
  `menuable`, and self-referencing `parent`/`children` for nesting.
- **`NavMenu`** — the registry of locations a menu can be assigned to.
- **`MenuBox`** — the registry of content sources the builder can pull items
  from.

## Locations

Register the locations a menu can be assigned to. The `Admin` module registers
`primary` and `footer`; themes may add more through the same facade.

```php
use App\Facades\NavMenu;

NavMenu::make('primary', fn () => [
    'label' => __('admin.navMenu.primary'),
]);
```

Locations are read back by `App\Support\NavMenuRepository`. The current
assignment is stored in the application setting `nav_location` (an array of
`location => menu id`).

## Content sources (Menu Boxes)

Register a model as a source of menu items:

```php
use App\Facades\MenuBox;

MenuBox::make('posts', Post::class, fn () => [
    'label' => __('blog.nav.blogPosts'),
    'icon' => 'newspaper',
    'field' => 'title',   // attribute used as the item label
    'priority' => 10,
]);
```

`App\Support\MenuBoxRepository::all()` sorts boxes by `priority`.
`Modules\Admin\Support\MenuCatalog::boxItems($box, $search)` feeds the admin
builder's item picker: it queries the box's model (handling translatable models
via their `translations` relation and the configured `field`) and returns
`{ id, text, menuable_class, menuable_class_name }`.

## The MenuItem model

A custom link has no `menuable` and stores its destination on `link`; a
model-backed item stores `menuable_type`/`menuable_id` and derives its URL from
the model:

```php
$item->is_custom;            // no menuable_type and no menuable_id
$item->menuable_class_name;  // class_basename of menuable_type
$item->url;                  // link (custom) or $menuable->getUrl()
```

Labels are translatable (`translatedAttributes = ['label']`), so `MenuItem`
requires the matching `MenuItemTranslation` model.

## Admin menu builder

| Route (name) | Purpose |
| --- | --- |
| `admin.menus.index` | List menus, boxes and locations; select one via `?menu=`. |
| `admin.menus.store` | Create a menu. |
| `admin.menus.box-items` | JSON feed of items for a box (`admin.menus.box-items`). |
| `admin.menus.update` | Persist the menu tree (`content` JSON) and locations. |
| `admin.menus.destroy` | Delete a menu. |

`MenuController` returns `Admin::menus/Index` with `menus`, `boxes` (from
`MenuCatalog::boxes()`), `locations` (from `MenuCatalog::locations()`), the
selected menu id and the user's `abilities`. Updates run through
`Modules\Admin\Actions\Menu\UpdateMenu`, which syncs items
(`SyncMenuItems`) and the location assignments (`SyncMenuLocations`).

## Rendering

Themes read the assigned menu and resolve its URL tree. Fetch items with the
eager-loading scope on the model:

```php
$menu = Menu::withDataItems()->find($menuId);   // items + translations + menuable, nested
```

`MenuItem::getUrl()` resolves the destination for custom links and model-backed
items alike. Model classes that can be linked (e.g. blog `Post`, `Category`)
expose a `getUrl()` method so the menu can derive the URL without storing it.

## Conventions

- Register locations and boxes from the owning module/theme provider so they
  only exist while that package is enabled.
- Give every linkable model a `getUrl()` method to make it usable as a menu
  item.
- Translatable models are matched on their `translations` relation using the
  box's `field`, so keep that field a translated attribute.
- Do not hard-code a location in a theme; read the menu assigned to it from
  `nav_location`.
