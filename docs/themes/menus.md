# Themes — Nav Menus

Navigation menus are edited in the admin and assigned to **locations** the theme
defines (for example `primary`, `footer`). The active assignment is stored in the
application setting `nav_location` (`location => menu id`).

## Register locations (backend)

Register the locations a menu can be assigned to from the theme service
provider's `boot()`. The `Admin` module registers `primary` and `footer` as
defaults; a theme may add its own through the same facade:

```php
use App\Facades\NavMenu;

protected function registerMenuLocations(): void
{
    NavMenu::make('primary', fn () => [
        'label' => __('default::messages.nav_primary'),
    ]);

    NavMenu::make('footer', fn () => [
        'label' => __('default::messages.nav_footer'),
    ]);
}
```

Locations are read back by `App\Support\NavMenuRepository`. Register them from
the theme provider so an inactive theme contributes no locations.

## Render the assigned menu

The theme reads the assigned menu and renders its resolved tree. Fetch the menu
with its nested, translated, linkable items:

```php
use App\Models\Menus\Menu;
use App\Facades\Setting;

$menuId = Setting::get('nav_location')['primary'] ?? null;
$menu = $menuId ? Menu::withDataItems()->find($menuId) : null;
```

`MenuItem::getUrl()` resolves the destination for custom links and model-backed
items alike; linkable models expose a `getUrl()` method for this purpose.

The full model — locations (`NavMenu`), content sources (`MenuBox`), menu items
and the admin builder — is documented in
[Navigation Menus](../the-basics/navigation-menus.md).

## See also

- [Navigation Menus](../the-basics/navigation-menus.md)
- [Templates & Blocks](templates.md)
