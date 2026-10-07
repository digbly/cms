# Modules — Helpers

Frontend helpers shared by every admin page (and available to theme front
ends), plus the PHP helpers modules commonly use.

## Frontend helpers

- `route(name, params?)` (`resources/views/lib/route.ts`) builds a URL from the
  shared `routes` prop: `route('admin.blog.posts.index')`,
  `route('admin.blog.posts.destroy', { post: id })`. Placeholders use `{param}`;
  extra keys become a query string. It is also exposed globally as
  `window.route`.
- `useTranslation()` (`resources/views/hooks/useTranslation.ts`) resolves
  `'<namespace>.<key.path>'` from the shared `translations` prop and accepts an
  optional fallback: `t('admin.nav.dashboard', 'Dashboard')`.
- `AdminLayout` reads `admin_menu`, `admin_prefix`, `flash` and `auth.user`,
  renders the sidebar/topbar, and accepts a `title` prop.

## PHP helpers

From `app/Support/helpers.php`:

| Helper | Description |
| --- | --- |
| `admin_url(?string $uri = null)` | Builds a URL under the admin prefix. |
| `theme()` | The active `App\Themes\Theme`, or `null`. |
| `theme_name()` | The active theme alias (falls back to `themes.default`). |
| `theme_setting(?string $key, $default)` | A [theme setting](../the-basics/theme-settings.md). |
| `theme_path(string $theme, string $path = '')` | Absolute path inside a theme. |
| `theme_asset(string $asset, ?string $theme)` | URL to a published theme asset. |
| `is_json(mixed $value)` | Whether a string is valid JSON. |

Module code also has `module_path($name, $path)` from
`nwidart/laravel-modules` and the `Modules\...` PSR-4 namespace.

## See also

- [Theme Helpers](../themes/helpers.md)
- [Information](information.md)
