# Theme Settings & Customizer

Theme settings are application settings that are **scoped to a theme**. They are
defined in code by the theme's service provider, stored per theme in the
database, and surfaced to the frontend through the customizer.

There are two collaborating registries:

- **Theme settings** — the typed key/value options a theme reads at runtime.
- **Customizer** — the panels, sections and controls that let an editor change
  those settings (and page blocks and widgets) from the admin.

## Theme settings

Register definitions from the theme service provider's `boot()`:

```php
use App\Facades\ThemeSetting;

ThemeSetting::make('home_page')
    ->type('string')
    ->default(null)
    ->add();
```

`ThemeSetting::make($key)` returns an `App\Support\Entities\ThemeSetting`
builder with `label()`, `type()`, `default()`, `showApi()` and `add()`. Because
theme settings are theme-scoped, there is no `translatable()` and no `rules()` —
validation is owned by the customizer request.

### Reading values

Use the `theme_setting()` helper or the facade:

```php
theme_setting('home_page');              // ?string — current theme's value
theme_setting();                         // the repository instance
theme_setting('home_page', 'default');   // with fallback
```

Values resolve as: stored value for the **active theme** → the definition's
`default` → the fallback. `ThemeSettingRepository` is keyed by `theme_name()`
and caches under `theme_settings.configs.<theme>`.

The repository also exposes `boolean()`, `integer()`, `float()`, `gets()` and
`set()` mirroring the application [Settings](settings.md) API.

```php
theme_setting()->set('home_page', $pageId);
```

## Customizer

The customizer is a backend-authored UI tree rendered by the admin. Themes (and
modules) contribute to it through the `App\Facades\Customize` facade, which
wraps `App\Support\Customizes\CustomizeRegistry`.

```php
use App\Facades\Customize;
use App\Support\Customizes\Customize as CustomizeBuilder;
use App\Support\Customizes\CustomizeControl;

Customize::register(function (CustomizeBuilder $customize): void {
    $customize->addSection('home_page_settings', [
        'title' => __('admin.customize.home_page'),
        'priority' => 1,
    ]);

    $customize->addControl(new CustomizeControl('home_page', [
        'label' => __('admin.customize.home_page'),
        'section' => 'home_page_settings',
        'settings' => 'home_page',
        'type' => 'homepage',
        'is_theme' => true,
    ]));
});
```

A `Customize` instance holds four ordered collections:

| Method | Purpose |
| --- | --- |
| `addPanel($key, $args)` | Top-level customizer panel. |
| `addSection($key, $args)` | A section inside the panels. |
| `addSetting($key, $args)` | A raw setting a control can bind to. |
| `addControl(CustomizeControl)` | An interactive control (bound to a setting). |

Controls are created with `new CustomizeControl($key, $args)`. Common args are
`label`, `section`, `settings`, `type` and `is_theme`. The `type` selects the
frontend editor widget (`homepage`, `widgets`, `site_identity`, ...); a control
with `is_theme => true` writes to the active theme's settings, otherwise it
writes to application settings.

### Admin integration

`Modules\Admin\Http\Controllers\Web\CustomizeController` builds the payload from
`Modules\Admin\Support\CustomizeCatalog`, which starts from a base `Customize`
instance, applies every registered callback, and then merges the registered
[page templates/blocks](pages.md) and [sidebars/widgets](widgets.md). Saving is
handled by `UpdateCustomize`, which routes values to `Setting` or
`ThemeSetting` based on `is_theme`, and delegates block/widget edits to their
respective actions.

## Homepage control

The bundled `default` theme pairs a `home_page` theme setting with the
`homepage` control type. The chosen page id is read back by `Page::home()`:

```php
// app/Models/Pages/Page.php
public static function home(): ?self
{
    if ($homeId = theme_setting('home_page')) {
        return static::find($homeId);
    }

    return null;
}
```

## Conventions

- Register theme settings and customizer panels from the theme service provider,
  so a disabled/inactive theme contributes nothing.
- Route a value to `ThemeSetting` (not `Setting`) when it only makes sense for
  the active theme, e.g. the homepage selection.
- Keep control `type` values in sync with the admin customizer frontend.
