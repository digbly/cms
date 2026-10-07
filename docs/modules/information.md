# Modules — Information

The admin is a **single Inertia (React) application**. There is no standalone
SPA and no JSON API: every module contributes its own backend routes, Inertia
pages, navigation entries and translations, and the shell composes them into one
app. Features are `nwidart/laravel-modules` packages living in `modules/`.

## How the admin is assembled

- The entry point is `resources/views/app.tsx`, rendered by the Blade root
  template `resources/views/app.blade.php` and built by the root Vite config
  (`vite.config.ts`).
- Shared UI and helpers live in `resources/views`: `components/ui/*` (buttons,
  inputs, modals, tables, ...), `components/NavIcon.tsx`,
  `components/ThemeProvider.tsx`, `hooks/` (`useTranslation`, `useDropdown`,
  `useFocusTrap`) and `lib/` (`route`, `url`, `inertia-form`, `validation`,
  `theme`, `inertia-pages`).
- Module pages live in `modules/<name>/resources/views` and are referenced by
  their namespaced component name from the controller, for example
  `Inertia::render('Admin::dashboard/Index')`, `'Auth::auth/Login'`,
  `'Blog::posts/Index'`.
- `resources/views/lib/inertia-pages.ts` resolves those names by globbing
  `resources/views/pages/**/*.{tsx,jsx}` (core pages) and
  `modules/*/resources/views/**/*.{tsx,jsx}` (module pages). The namespace
  (`Admin`, `Auth`, `Blog`, ...) is matched case-insensitively against the
  module directory name.
- Vite aliases configure imports: `@` points at `resources/views` and `@modules`
  at `modules/`.

## Directory layout

```
resources/views/
  app.tsx                  # Inertia entry (createInertiaApp)
  components/ui/           # shared design-system components
  components/NavIcon.tsx   # lucide icon registry used by the sidebar
  hooks/                   # useTranslation, useDropdown, useFocusTrap
  lib/                     # route(), url helpers, form/validation, page resolver
  types/                   # SharedProps, NavItem, AuthUser, ...
modules/<name>/resources/views/
  <area>/Index.tsx         # list pages
  <area>/Form.tsx          # create/edit pages
  components/              # module-specific components
  layouts/                 # AdminLayout (admin), AuthLayout (auth)
```

The admin shell lives in `modules/admin/resources/views/layouts/AdminLayout.tsx`
with `components/AdminSidebar.tsx` and `components/UserMenu.tsx`.

## Module registration

Every feature is an `nwidart/laravel-modules` package with its own service
provider, routes (`routes/web.php`), migrations, language files, tests and
Inertia (React) views under `resources/views`. Modules are registered through
their `module.json` manifest. `Admin` and `Auth` are core and always loaded from
`bootstrap/providers.php`; every other module is loaded by
`App\Modules\ModulesServiceProvider` from the activator settings.

See [Make CRUD](crud.md) for the end-to-end walkthrough of adding a module.

## Shared props

`App\Http\Middleware\HandleInertiaRequests::share()` sends these to every
Inertia response:

| Prop | Description |
| --- | --- |
| `auth.user` | Current user (`id`, `name`, `email`, `avatar_url`, `is_super_admin`, `permissions`) or `null` |
| `flash` | `success`, `error`, `warning` from the session |
| `admin_menu` | The permission-filtered sidebar tree (`NavItem[]`) |
| `admin_prefix` | Value of `ADMIN_PREFIX` (default `admin`) |
| `locale` | Current application locale |
| `translations` | Translation namespaces keyed by frontend namespace |
| `routes` | Named Laravel routes keyed by name, exposed to `route()` |

## Conventions and gotchas

- There is no `admin/` SPA and no `/api` admin layer. Pages come from
  `modules/*/resources/views`; controllers return `Inertia::render(...)` and
  redirects, not JSON resources.
- Inertia page components are **default exports**.
- Admin route names are prefixed `admin.` and grouped under
  `config('app.admin_prefix')`; the frontend builds URLs from those names with
  `route()`.
- Keep module pages free of cross-module imports except for the shared shell
  (`AdminLayout`) and shared UI under `@/components`.
- Do not add translation JSON to the frontend. Strings live in the backend:
  the shared shell in `resources/lang/{en,vi}/common.php`, and each module's
  own strings in that module's `resources/lang/` directory.
- New sidebar icons must be registered in
  `resources/views/components/NavIcon.tsx`.
- Name module pages `<area>/Index.tsx` and `<area>/Form.tsx` for consistency
  with the existing admin and blog modules.

## See also

- [Make CRUD](crud.md) · [Routing](routing.md)
- [Helpers](helpers.md) · [Commands](commands.md)
- [Admin Menus](../the-basics/menus.md) · [Permissions](../the-basics/permissions.md) · [Translation](../the-basics/translation.md)
