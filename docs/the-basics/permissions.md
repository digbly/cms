# Permissions

Authorization is enforced on the **backend**; the frontend only mirrors it for
usability. The catalog is declared in code through module permission enums and
persisted as Spatie permissions.

## Declare permissions

Add a PHP enum in the owning module (`modules/reports/app/Enums/Permission.php`)
with the permission cases and a `values()` method.

```php
namespace Modules\Reports\Enums;

enum Permission: string
{
    case View = 'reports.view';
    case Create = 'reports.create';
    case Update = 'reports.update';
    case Delete = 'reports.delete';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $case): string => $case->value,
            self::cases()
        );
    }
}
```

## Register permissions

Register the enum in `App\Providers\PermissionServiceProvider::boot()` by
spreading its `values()` into `App\Support\PermissionRegistry`:

```php
use Modules\Reports\Enums\Permission as ReportsPermission;

public function boot(): void
{
    $this->app->make(PermissionRegistry::class)->register([
        // existing enums...
        ...ReportsPermission::values(),
    ]);
}
```

`PermissionRegistry::register()` accepts a single permission string or an array
of them, stores them deduplicated, and `all()` returns the final catalog.

Existing enums: `Modules\Admin\Enums\*Permission`, `Modules\Blog\Enums\Permission`.

```bash
php artisan permission:generate
```

This syncs the catalog from the registry into Spatie's tables.

## Enforce them

- Web routes are guarded per action by `RequireAdminPermission`
  (`RequireAdminPermission::class.':'.Permission::View->value`) — see
  [Routing](../modules/routing.md).
- Controllers expose per-action `abilities` (via the `AuthorizesAdmin` trait) so
  pages can hide controls the user cannot use.
- Use the same permission string on the route, the
  [menu item](menus.md) and the enum case.
- `User::isSuperAdmin()` (`users.is_super_admin`) bypasses every check.
- `User::permissionNames()` returns the Spatie permission names, or `['*']` for
  super admins.
- `admin_menu` is already filtered by permission server-side.

## Adding a permission

1. Add the case to the module's permission enum.
2. Register it in `App\Providers\PermissionServiceProvider`.
3. Run `php artisan permission:generate`.
4. Reference the same value on the route middleware, the menu item and the enum.

## See also

- [Routing](../modules/routing.md) · [Admin Menus](menus.md)
