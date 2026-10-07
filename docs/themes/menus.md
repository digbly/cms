# Themes — Nav Menus

Navigation menus are edited in the admin and assigned to **locations** the theme
defines (for example `primary`, `footer`). The active assignment is stored in the
application setting `nav_location` (`location => menu id`).

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
