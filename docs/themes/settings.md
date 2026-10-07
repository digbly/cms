# Themes — Theme Configs

## theme.json

```json
{
    "name": "Default",
    "alias": "default",
    "description": "Default theme",
    "version": "1.0.0",
    "priority": 0,
    "providers": [
        "Themes\\Default\\Providers\\ThemeServiceProvider"
    ],
    "aliases": {},
    "files": []
}
```

- `name` is the identity used by the activator (the active theme name stored
  in settings, or `themes/statuses.json` with the file activator).
- `alias` is the lowercase key used for namespaces, config and helpers. Falls
  back to `name` when omitted.
- `priority` orders registration (`FileRepository::getOrdered()`).
- `providers` are resolved through Laravel's `ProviderRepository` with a
  per-theme cached services file (`<alias>_theme.php`).
- `views`, `assets`, `lang`, `config`, `routes` may override the default
  resource paths from `config/themes.php`.

## config/themes.php

- `default` — fallback theme alias.
- `current` — set at runtime by `ThemeManager` (read-only).
- `composer.vendor` — vendor name used by `theme:make` for the generated package.
- `paths.themes` / `paths.assets` / `paths.assets_url`.
- `paths.generator.*` — default resource subfolders.
- `scan` — additional theme roots (e.g. `vendor/*/*`).
- `register.translations` / `register.files`.
- `activator` — selects which activator to use (default `database`,
  `THEMES_ACTIVATOR`).
- `activators.<name>.class` — activator definitions. `activators.file.statuses-file`
  points to `themes/statuses.json`; `activators.database.key` (default `theme`)
  is the settings key that holds the active theme name.

## Theme settings

Per-theme options registered in code and edited through the customizer are
covered in [Theme Settings](../the-basics/theme-settings.md).

## See also

- [Information](information.md) · [Asset Compilation](assets.md)
