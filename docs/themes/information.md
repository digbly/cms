# Themes — Information

Multiple themes, built on the same architecture as `nwidart/laravel-modules`. A
theme is a full package: it has a manifest (`theme.json`), a service provider,
views, assets, translations, config and routes. Themes live in `themes/`.

The registry is deliberately a structural mirror of modules so the mental model
is identical: *discover → activate → register → boot*.

## Directory layout

```
themes/
  <theme>/
    theme.json
    composer.json         # PSR-4 "Themes\\<Theme>\\" => "app/", merged via composer-merge-plugin
    app/Providers/ThemeServiceProvider.php
    config/config.php
    resources/
      views/            # Blade views + optional Inertia (React) pages/components
      assets/           # css/js/img, published to public/themes/<theme>
      lang/             # namespaced translations
    routes/web.php
  statuses.json         # activation statuses (file activator only)
```

Core classes:

```
app/
  Themes/
    Theme.php                    # package object (≈ Nwidart\Modules\Module)
    FileRepository.php           # scans themes (≈ Nwidart\Modules\FileRepository)
    FileActivator.php            # statuses.json (≈ Nwidart\Modules\FileActivator)
    DatabaseActivator.php        # active theme name stored in settings
    ThemeManager.php             # resolves + activates the active theme
    ThemesServiceProvider.php    # container bindings + boot
    Exceptions/ThemeNotFoundException.php
  Contracts/ThemeActivator.php
config/themes.php
```

## Mapping to laravel-modules

| Modules | Themes |
| --- | --- |
| `modules/<Name>/module.json` | `themes/<Theme>/theme.json` |
| `modules/<Name>/composer.json` | `themes/<Theme>/composer.json` |
| `Nwidart\Modules\Module` | `App\Themes\Theme` |
| `Nwidart\Modules\FileRepository` | `App\Themes\FileRepository` |
| `Nwidart\Modules\Activators\FileActivator` | `App\Themes\FileActivator` |
| settings-backed module activator (`plugin_statuses`) | `App\Themes\DatabaseActivator` (`theme`) |
| `modules/statuses.json` | `themes/statuses.json` |
| `RepositoryInterface` (bound as `modules`) | `FileRepository` (bound as `themes`) |
| `module_path()` | `theme_path()` |

Like modules, each theme is a composer package: its `composer.json` maps
`"Themes\\<Theme>\\": "app/"` and is pulled in by
`wikimedia/composer-merge-plugin` via the root `extra.merge-plugin.include`
patterns (`modules/*/composer.json`, `themes/*/composer.json`). PHP classes
therefore live under `themes/<Theme>/app/`, and autoloading requires
`composer dump-autoload` after a theme is added — which `theme:make` runs for
you. `theme.json` reuses the same `Json` reader from the modules package
(`Nwidart\Modules\Json`).

## Registration flow

`App\Themes\ThemesServiceProvider` is registered after `AppServiceProvider`
in `bootstrap/providers.php`.

1. **register()** — merges `config/themes.php`, binds `ThemeActivator`,
   `FileRepository` (alias `themes`) and `ThemeManager` as singletons, then
   calls `FileRepository::register()` for every enabled theme. Each `Theme`
   registers its aliases, providers and include files.
2. **boot()** — calls `FileRepository::boot()` (files-on-boot mode), then
   `ThemeManager::activate()` which resolves the active theme and installs its
   views, config, translations and routes.

Code-level registration (`register()` / `boot()`) runs for **every enabled
theme**; render-level registration (views, config, translations, routes) runs
for the **active theme only**, so themes cannot bleed into each other's output.

The active theme is resolved once during boot by `ThemeManager::activate()`.

## Theme selection

`ThemeManager::resolve()` picks the first enabled candidate:

1. an explicit theme passed to `resolve()` / `activate()`,
2. `config('themes.default')` (`THEME_DEFAULT`, default `default`),

then falls back to the first enabled theme, or `null` when no theme is enabled.

```php
app(App\Themes\ThemeManager::class)->activate('another');
```

In console (no request) resolution falls back to the default theme.

## Activation

The default **database** activator stores the active theme name in the settings
(`theme` key), so **only one theme can be active at a time**. A theme is enabled
only when it is the stored active theme; every other theme is disabled.

```php
app('themes')->findOrFail('Default')->enable();   // sets the active theme
app('themes')->findOrFail('Another')->disable();  // clears it when it matches
app('themes')->allEnabled();                      // at most one theme
```

The **file** activator (`FileActivator`) keeps the legacy behaviour: statuses
are stored in `themes/statuses.json` and a theme not listed is disabled. Select
it with `THEMES_ACTIVATOR=file` or `themes.activator => 'file'`.

```json
{
    "Default": true,
    "Another": false
}
```

## View resolution and precedence

The active theme is installed in two ways:

- `View::addNamespace('<alias>', <views>)` — renders `default::welcome`.
- `View::getFinder()->prependLocation(<views>)` — transparently overrides
  application views (`view('welcome')`).

Precedence is intentionally **Theme > App**. Module views are namespaced
(`auth::...`) and are never touched, so a theme cannot override a module. This
keeps modules isolated and prevents a theme from breaking a module's internal
templates.

```
view('welcome')      → theme default, else app
view('default::x')   → theme default only
view('auth::login')  → module auth only
```

A theme that needs to override a module must do so deliberately, e.g. by
registering the module's namespace path from its own provider.

## Create a theme

```bash
php artisan theme:make blog
```

Or manually:

1. Create `themes/<Studly>/theme.json` with `name` and `alias`.
2. Add `themes/<Studly>/composer.json` mapping `"Themes\\<Studly>\\": "app/"`,
   then add `app/Providers/ThemeServiceProvider.php` and list its class in
   `providers`.
3. Put Blade templates in `resources/views`, assets in `resources/assets`,
   translations in `resources/lang`, config in `config`, routes in `routes`.
4. Enable it: run `theme:enable <Name>` (the default database activator stores
   it as the active theme; with the file activator, add
   `"<Name>": true` to `themes/statuses.json`).
5. Run `composer dump-autoload` and select it via `THEME_DEFAULT`.

`theme_path('default', 'resources/views/theme.blade.php')` is handy while
scaffolding, and `theme:publish <Name>` copies assets into
`public/themes/<alias>`.

## Gotchas

- Theme aliases share the view-namespace registry with modules; avoid aliases
  that collide with a module lower name (e.g. `auth`).
- A theme's `config/config.php` is merged under the alias as a config key, so an
  alias matching a core config file (e.g. `app`, `database`) would overwrite it.
  Keep aliases unique and non-core.
- Theme routes (`routes/web.php`) are loaded only for the active theme, under
  the `web` middleware group.
- Unlisted themes are disabled; a fresh theme will not render until enabled.
- `ThemeManager::activate()` can be re-run per request to preview a theme;
  view locations are prepended, so repeated activation within one process keeps
  the last active theme on top.
- Config caches: run `php artisan config:clear` after editing
  `config/themes.php`.

## Verify

```bash
php artisan config:clear
php artisan about
php artisan tinker --execute="var_dump(app('themes')->allEnabled(), theme_name());"
```

## Relationship with modules

Modules and themes are independent registries. Modules provide backend features
and namespaced views/routes; themes provide the public presentation layer. A
module view is always resolved from its own namespace, so adding a theme never
changes module behavior. This is the isolation guarantee that keeps the two
systems composable.

## See also

- [Asset Compilation](assets.md) · [Commands](commands.md) · [Helpers](helpers.md)
- [Theme Configs](settings.md) · [Templates & Blocks](templates.md) · [Widgets](widgets.md)
