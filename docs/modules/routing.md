# Modules — Routing

Module routes live in `modules/<name>/routes/web.php` and are mapped by the
module's `RouteServiceProvider` under the `web` middleware group. All admin
routes are grouped under `config('app.admin_prefix')` and named `admin.*`.

`modules/reports/routes/web.php`:

```php
use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Middleware\RequireAdminPermission;
use Modules\Reports\Enums\Permission;
use Modules\Reports\Http\Controllers\Web\ReportController;

Route::middleware(['auth:web'])
    ->prefix(config('app.admin_prefix', 'admin'))
    ->group(function () {
        Route::prefix('reports')->name('admin.reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])
                ->middleware(RequireAdminPermission::class.':'.Permission::View->value)
                ->name('index');
        });
    });
```

## Conventions

- Always wrap routes in `middleware(['auth:web'])` and the admin prefix group.
- Name routes `admin.<module>.<resource>.<action>` (`index`, `create`, `store`,
  `edit`, `update`, `destroy`), matching the existing admin and blog modules.
- Guard every action with `RequireAdminPermission::class.':'.<Permission>::<Action>->value`.
  The same permission string is used on the [menu item](../the-basics/menus.md)
  and the permission enum — see [Permissions](../the-basics/permissions.md).
- The frontend builds URLs from the route names with `route()`; never hard-code
  the admin prefix.

## See also

- [Make CRUD](crud.md) · [Information](information.md)
- [Permissions](../the-basics/permissions.md)
