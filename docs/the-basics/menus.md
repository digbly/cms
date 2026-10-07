# Admin Menus

The admin sidebar is built on the **backend** and shipped to the SPA as a
permission-filtered tree. A sidebar entry is registered from the owning module's
service provider `boot()`, so a disabled module contributes nothing.

## Register a sidebar entry

```php
use App\Facades\Menu;
use App\Support\MenuRepository;

Menu::make('reports', fn () => [
    'label' => __('reports.nav.reports'),
    'to' => '/reports',                    // SPA path, relative to the admin prefix
    'icon' => 'file-text',                 // lucide icon name (see NavIcon)
    'permission' => Permission::View->value,
    'position' => MenuRepository::POSITION_ADMIN,
    'priority' => 70,
]);
```

- `to` is a path inside the admin app (no `ADMIN_PREFIX`); the frontend joins it
  with the shared `admin_prefix`.
- An item with a `parent` key becomes a child of that parent (collapsible
  group); the parent usually has no `to`.
- `priority` controls ordering.
- New icons must be added to `resources/views/components/NavIcon.tsx`; unknown
  names fall back to a plain circle.

The registry is `App\Support\MenuRepository`, exposed through the
`App\Facades\Menu` facade (`make()`, `get()`, `getByPosition()`, `tree()`,
`all()`).

## Navigation contract

The sidebar tree is built server-side by `Menu::tree('admin')` and filtered in
`HandleInertiaRequests::adminMenu()` against the user's permissions (super
admins see everything). The serialised item shape (`NavItem`):

```ts
interface NavItem {
    key: string;
    label: string;               // already translated for the request
    to: string | null;           // SPA path (no admin prefix), null for groups
    icon: string | null;         // lucide icon name, mapped in NavIcon.tsx
    permission: string | null;
    children: NavItem[];
}
```

`AdminSidebar` renders this tree and highlights the active item from the current
Inertia URL.

## See also

- [Navigation Menus](navigation-menus.md) — the editable content menus shown on
  the frontend (Header, Footer, ...), a different system.
- [Permissions](permissions.md)
- [Modules — Information](../modules/information.md)
