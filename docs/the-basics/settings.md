# Setting

Juzaweb CMS provides a Helper/Facade `Setting` (mapped to `Juzaweb\Modules\Core\Contracts\Setting`) to manage global configurations. These settings are stored in the database and are available system-wide.

## Usage

```php
use Juzaweb\Modules\Core\Facades\Setting;

// Get a setting value
$value = Setting::get('key');
```

## Available Methods

### get($key, $default = null)

Retrieve the value of a setting key.

```php
$value = Setting::get('site_title', 'Juzaweb CMS');
```

### set($key, $value = null)

Set a configuration value.

```php
Setting::set('site_title', 'My Awesome Site');
```

### sets(array $keys)

Set multiple configuration values at once.

```php
Setting::sets([
    'facebook_url' => 'https://facebook.com',
    'twitter_url' => 'https://twitter.com',
]);
```

### gets(array $keys, $default = null)

Retrieve values for multiple keys.

```php
$socials = Setting::gets(['facebook_url', 'twitter_url']);
```

### all()

Retrieve all global settings.

```php
$allSettings = Setting::all();
```

### boolean($key, $default = null)

Retrieve a setting value as a boolean.

```php
if (Setting::boolean('enable_registration')) {
    // ...
}
```

### integer($key, $default = null)

Retrieve a setting value as an integer.

```php
$limit = Setting::integer('paginate', 10);
```

### float($key, $default = null)

Retrieve a setting value as a float.

```php
$price = Setting::float('tax', 0.1);
```
