# Modules — Make CRUD

End-to-end walkthrough of adding a feature module. The example module is
`reports`. Cross-cutting pieces (sidebar, permissions, translations) live in
[The Basics](../the-basics/menus.md); this page covers the module itself.

## 1. Scaffold and wire the module

```bash
php artisan module:make Reports
```

The module gets a service provider (extending
`Nwidart\Modules\Support\ModuleServiceProvider`) and a `RouteServiceProvider`
that maps `routes/web.php`. Add the module to the activator (or enable it) so
`App\Modules\ModulesServiceProvider` boots it. `Admin` and `Auth` are core and
always loaded from `bootstrap/providers.php`.

## 2. Add the routes

See [Routing](routing.md) for the full route file. At minimum, register the
admin routes under the admin prefix and guard each action with
`RequireAdminPermission`.

## 3. Return an Inertia page from the controller

```php
public function index(Request $request): \Inertia\Response
{
    return Inertia::render('Reports::reports/Index', [
        'title' => __('reports.title'),
        'reports' => ReportResource::collection(
            Report::query()->paginate()
        ),
    ]);
}
```

Validate writes with a `FormRequest` and serialise models with an API
`Resource`, exactly as the other modules do.

## 4. Add the React page

`modules/reports/resources/views/reports/Index.tsx`:

```tsx
import AdminLayout from '@modules/admin/resources/views/layouts/AdminLayout';
import { useTranslation } from '@/hooks/useTranslation';

interface ReportsProps {
    title: string;
    reports: { data: unknown[] };
}

export default function Reports({ title, reports }: ReportsProps) {
    const { t } = useTranslation();

    return (
        <AdminLayout title={title}>
            <h1>{t('reports.title')}</h1>
            {/* feature UI */}
        </AdminLayout>
    );
}
```

Pages are default-exported components. They receive the props passed by the
controller plus the [shared props](information.md#shared-props).

Name list pages `<area>/Index.tsx` and create/edit pages `<area>/Form.tsx`.

## 5. Finish the cross-cutting wiring

- **Sidebar entry** — register it from the module provider's `boot()`; see
  [Admin Menus](../the-basics/menus.md).
- **Translations** — register the namespace and add
  `resources/lang/{en,vi}/<group>.php`; see
  [Translation](../the-basics/translation.md).
- **Permissions** — declare the enum and run `permission:generate`; see
  [Permissions](../the-basics/permissions.md).

## 6. Build

```bash
npm run build
```

The page glob is resolved by Vite at build time, so a new page is not available
until the admin front end is rebuilt.

## Verify

```bash
npm run build          # build the admin front end (tsc via Vite)
php artisan test       # AdminModule / BlogModule suites
vendor/bin/pint        # PHP code style
```

## Checklist

- [ ] Module scaffolded and enabled so its service provider boots
- [ ] `routes/web.php` maps the module's admin routes under the admin prefix
- [ ] Controller returns `Inertia::render('<Module>::<area>/<Page>', [...])`
- [ ] `FormRequest` + `Resource` used for writes and serialisation
- [ ] React page added under `modules/<name>/resources/views/<area>/` with a default export
- [ ] Sidebar item registered via `Menu::make()` with `to`, `icon`, `permission` and `priority`
- [ ] New icon (if any) added to `resources/views/components/NavIcon.tsx`
- [ ] Namespace registered via `AdminTranslation::make()`; `resources/lang/{en,vi}/<group>.php` added
- [ ] New permission (if any) added to a permission enum and registered in `PermissionServiceProvider`, then `php artisan permission:generate`
- [ ] `npm run build` and `php artisan test` pass

## See also

- [Information](information.md) · [Routing](routing.md)
