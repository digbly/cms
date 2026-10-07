# Laravel CMS

**A modular, theme-driven CMS platform for Laravel 12 — build once, extend forever.**

Ship a full admin panel, a public website, and any feature you can imagine without
forking a monolith. Features are pluggable modules, presentation is swappable
themes, and every front end is a modern React app — all wired together by their
own auto-discovering registries.

> Laravel 12 · PHP 8.2+ · Inertia + React 19 · Tailwind CSS 4 · Vite 7 · TypeScript

---

## Why Laravel CMS?

Most CMSes make you choose between a rigid plugin system or bending a monolith to
your will. This one gives you both an opinionated foundation **and** clean seams:

- **Drop-in modules** — add a capability as a self-contained package in `modules/`;
  it registers its own routes, migrations, views, translations and admin pages.
- **Swappable themes** — package an entire front end (views, assets, config,
  routes, translations) in `themes/` and activate it at runtime.
- **One React shell, many contributors** — the admin is a single Inertia (React)
  app where each enabled module injects its pages into the same layout.
- **Server-side rendering built in** — the active theme can render via SSR for
  fast first paint and SEO-friendly HTML.
- **Battle-tested internals** — Spatie permissions, media library, activity log,
  translatable models and OpenAPI annotations come pre-wired.

Turn features on and off from a single registry:

```json
// modules/statuses.json
{
  "Auth": true,
  "Admin": true,
  "Blog": true
}
```

---

## Features

### Core platform
- **Admin dashboard** — manage users, roles and permissions from one polished UI.
- **Authentication & identity** — session login, registration, email verification,
  password reset and profile management, plus Google / Facebook / GitHub social
  login via Socialite and Passport for OAuth2 / token infrastructure.
- **Themes** — full theme packages (`theme.json`, views, assets, translations,
  config, routes), modelled after `nwidart/laravel-modules`. The bundled
  `default` theme ships its own self-contained Inertia (React) front end.
- **Blog module** — posts, categories and comments with fully translatable content.
- **Appearance tools** — pages and page blocks, navigation menus, widgets,
  sidebars and a live customizer. Drag-and-drop powered by `@dnd-kit`.
- **Settings & localization** — global settings, languages and editable
  translations out of the box.
- **Media library** — powered by `spatie/laravel-medialibrary`.
- **Permissions** — granular RBAC via `spatie/laravel-permission`.
- **Audit log** — every meaningful change tracked with `spatie/laravel-activitylog`.
- **SEO ready** — sitemap generation with `spatie/laravel-sitemap` and SSR for the
  public site.

### Developer experience
- **OpenAPI schema annotations** — API resources and form requests annotated for
  `darkaonline/l5-swagger`.
- **Codegen scaffolding** — CRUD and module generators to skip the boilerplate.
- **Theme CLI** — `make`, `enable`, `disable`, `list`, `build`, `publish` and
  `ssr` commands for the full theme lifecycle.
- **Helper functions** — `theme()`, `theme_setting()`, `theme_asset()`,
  `admin_url()` and friends to keep module/theme code terse.

---

## Requirements

- PHP 8.2 or newer with the usual Laravel extensions
- Composer 2
- Node.js 20+ and npm
- A database — SQLite works out of the box; MySQL / PostgreSQL are supported

---

## Installation

```bash
# 1. Install PHP dependencies
composer install

# 2. Create the environment file and application key
cp .env.example .env
php artisan key:generate

# 3. Run migrations (module migrations are auto-discovered) and seed
php artisan migrate --seed

# 4. Generate the permissions registry
php artisan permission:generate

# 5. Build the admin Inertia front end
npm install
npm run build

# 6. Install the default theme's dependencies and build its front end
cd themes/default && npm install && cd ../..
php artisan theme:build default
```

Then start the application:

```bash
php artisan serve
```

The seeded test user is `test@example.com` (password `password`). Create a super
admin with:

```bash
php artisan make:user --super-admin
```

### Local development

Run the server, queue listener and Vite dev server together:

```bash
composer dev
```

---

## Project structure

```
app/            Core application code and support helpers
modules/        Pluggable features (Admin, Auth, Blog, …)
themes/         Swappable front ends (default, …)
docs/           In-depth guides for the basics, modules and themes
```

---

## Documentation

**The Basics**
- [Settings](docs/the-basics/settings.md)
- [Theme Settings](docs/the-basics/theme-settings.md)
- [Translation](docs/the-basics/translation.md)
- [Permissions](docs/the-basics/permissions.md)
- [Admin Menus](docs/the-basics/menus.md)
- [Navigation Menus](docs/the-basics/navigation-menus.md)
- [Widgets & Sidebars](docs/the-basics/widgets.md)
- [Pages, Templates & Blocks](docs/the-basics/pages.md)

**Modules**
- [Information](docs/modules/information.md)
- [Make CRUD](docs/modules/crud.md)
- [Routing](docs/modules/routing.md)
- [Helpers](docs/modules/helpers.md)
- [Commands](docs/modules/commands.md)

**Themes**
- [Information](docs/themes/information.md)
- [Asset Compilation](docs/themes/assets.md)
- [Theme Commands](docs/themes/commands.md)
- [Theme Helpers](docs/themes/helpers.md)
- [Theme Configs](docs/themes/settings.md)
- [Nav Menus](docs/themes/menus.md)
- [Templates & Blocks](docs/themes/templates.md)
- [Widgets](docs/themes/widgets.md)

---

## License

The Laravel framework is open-sourced software licensed under the
[MIT license](https://opensource.org/licenses/MIT).
