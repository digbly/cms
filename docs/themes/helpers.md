# Themes — Theme Helpers

```php
theme();                       // ?App\Themes\Theme — active theme
theme_name();                  // ?string — active alias (falls back to default)
theme_setting('home_page');    // mixed — active theme's setting
theme_path('default', 'resources/views');
theme_asset('css/app.css');    // http://host/themes/default/css/app.css
```

These are defined in `app/Support/helpers.php`. `theme_path()` resolves against
the theme repository (or `config('themes.paths.themes')`), and `theme_asset()`
prepends `themes.paths.assets_url` to build the URL under
`public/themes/<alias>`.

## See also

- [Modules — Helpers](../modules/helpers.md)
- [Theme Settings](../the-basics/theme-settings.md)
