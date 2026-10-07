Juzaweb CMS provides a Facade `ThemeSetting` (mapped to `Juzaweb\Modules\Core\Contracts\ThemeSetting`) to manage theme-specific configurations. These settings are stored in the database and are associated with the currently active theme.

## Usage

```php
use Juzaweb\Modules\Core\Facades\ThemeSetting;

// Get a setting value
$value = ThemeSetting::get('key');
```

## Available Methods

### get($key, $default = null)

Retrieve the value of a theme setting key.

```php
$value = ThemeSetting::get('contact_email', 'admin@example.com');
```

### set($key, $value = null)

Set a configuration value for the current theme.

```php
ThemeSetting::set('contact_email', 'new-email@example.com');
```

### sets(array $keys)

Set multiple configuration values at once.

```php
ThemeSetting::sets([
    'facebook_url' => 'https://facebook.com',
    'twitter_url' => 'https://twitter.com',
]);
```

### gets(array $keys, $default = null)

Retrieve values for multiple keys.

```php
$socials = ThemeSetting::gets(['facebook_url', 'twitter_url']);
```

### all()

Retrieve all settings for the current theme.

```php
$allSettings = ThemeSetting::all();
```

### boolean($key, $default = null)

Retrieve a setting value as a boolean.

```php
if (ThemeSetting::boolean('show_banner')) {
    // ...
}
```

### integer($key, $default = null)

Retrieve a setting value as an integer.

```php
$limit = ThemeSetting::integer('posts_per_page', 10);
```

### float($key, $default = null)

Retrieve a setting value as a float.

```php
$price = ThemeSetting::float('tax_rate', 0.1);
```
