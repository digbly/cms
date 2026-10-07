# Theme Helpers

Juzaweb CMS provides a Facade `Theme` (mapped to `Juzaweb\Modules\Core\Themes\ThemeRepository`) to manage themes easily.

## Usage

```php
use Juzaweb\Modules\Core\Facades\Theme;

// Get all themes
$themes = Theme::all();
```

## Available Methods

### all()

Get all valid themes found in the `themes` directory.

```php
// Returns Illuminate\Support\Collection
$themes = Theme::all();
```

### find($name)

Find a specific theme by name. Returns `null` if not found.

```php
$theme = Theme::find('itech');
```

### findOrFail($name)

Find a specific theme by name. Throws `Juzaweb\Modules\Core\Themes\Exceptions\ThemeNotFoundException` if not found.

```php
$theme = Theme::findOrFail('itech');
```

### current()

Get the currently active theme.

```php
$currentTheme = Theme::current();
```

### has($name)

Check if a theme exists.

```php
if (Theme::has('itech')) {
    // Theme exists
}
```

### activate($name)

Activate a theme by name.

```php
Theme::activate('itech');
```

### getModulePath($name)

Get the path of a specific module (note: this might be inherited or a utility, check usages). In the context of the Theme Repository, standard methods are focused on Theme entities.

### getPath()

Get the themes storage path.

```php
$path = Theme::getPath();
```
