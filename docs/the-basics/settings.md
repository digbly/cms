# Settings

Application settings are **defined in code** and **stored in the database**. A
module or theme registers setting definitions once at boot through the
`App\Facades\Setting` facade; the `SettingRepository` reads them back, resolves
values from the `settings` table (with cache) and exposes typed accessors.

This replaces the previous `config('settings')` approach: definitions live in
the in-memory `App\Support\SettingsRegistry`, values live in the database and the
admin validation request is derived from the same definitions.

## Register a setting

Register definitions from a service provider's `boot()`:

```php
use App\Facades\Setting;

Setting::make('title')
    ->default((string) config('app.name'))
    ->type('string')
    ->translatable()
    ->rules(['nullable', 'string', 'max:255'])
    ->add();
```

`Setting::make($key)` returns an `App\Support\Entities\Setting` builder. Calling
`add()` writes the definition into the `SettingsRegistry`; if you do not call it
explicitly, the entity's destructor adds it for you.

## Builder API

| Method | Description |
| --- | --- |
| `label(string)` | Human label shown in the admin (defaults to the key). |
| `type(string)` | `string`, `text`, `boolean`, `integer`, `float`, `media`. |
| `default(mixed)` | Fallback value when nothing is stored. |
| `rules(array)` | Validation rules used by the admin `SettingRequest`. |
| `translatable(bool = true)` | Store one value per locale. |
| `showApi(bool)` / `disableShowApi()` | Whether the setting is exposed to the API. |
| `add()` | Publish the definition to the registry. |

## Reading values

Resolve the repository from the container or the facade:

```php
use App\Facades\Setting;

Setting::get('title');                 // mixed
Setting::boolean('user_registration'); // ?bool
Setting::integer('per_page');          // ?int
Setting::float('vat_rate');            // ?float
Setting::gets(['title', 'description']); // array<string, mixed>
```

For a specific translation use the stateful `locale()` method:

```php
Setting::locale('vi')->get('title');
```

The repository resolves values in this order: stored database value → the
definition's `default` → the provided fallback.

> Note: theme-scoped settings use a different registry and the `theme_setting()`
> helper — see [Theme Settings](theme-settings.md).

## Translatable settings

A setting marked `translatable()` stores its value in `setting_translations`,
one row per locale. The `type` still drives casting. Store a locale's value
explicitly:

```php
Setting::locale('vi')->set('title', 'Tiêu đề');
```

`SettingRepository::localized()` returns all translatable settings grouped by
key with a `locale => value` collection.

## How values are stored

`SettingRepository::set()` uses `Setting::updateOrCreate` keyed by `code` and
flushes the `settings.configs` cache. Non-translatable values are stored on the
`settings` row; translatable values are written to the translation relation.

## Caching

Resolved configs are cached for one hour under `settings.configs` and memoised
per request. `set()` and `sets()` invalidate both the cache and the memo, so
values are always fresh after a write. To force a refresh outside a request:

```bash
php artisan cache:clear
```

## Admin integration

The admin settings screen (`Admin::settings/Index`) is served by
`Modules\Admin\Http\Controllers\Web\SettingController`. It builds its payload
from the registered definitions (`settings()`), resolves typed values and
media previews, and persists submitted data in a transaction through
`SettingRequest` (validation derived from each definition's `rules`).

## Conventions

- Define settings in the owning module or theme service provider, never in a
  central config file.
- Always provide `rules()` so the admin request can validate the value.
- Use `translatable()` only for values that genuinely differ per locale.
- Keys are global; prefix with the owner when a name could collide.
