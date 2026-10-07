# Breadcrumb

The `Breadcrumb` facade (mapped to `Juzaweb\Modules\Core\Contracts\Breadcrumb`) allows you to manage breadcrumbs in your application.

## Usage

```php
use Juzaweb\Modules\Core\Facades\Breadcrumb;

// Add a breadcrumb item
Breadcrumb::add('Home', '/');
Breadcrumb::add('Blog', '/blog');
Breadcrumb::add('My Post'); // No URL for the last item

// Add multiple items
Breadcrumb::items([
    [
        'title' => 'Home',
        'url' => '/',
    ],
    [
        'title' => 'Products',
        'url' => '/products',
    ],
]);
```

## Methods

- `add(string $title, string $url = null)`: Add a single item.
- `items(array $items)`: Set all items (replaces existing).
- `addItems(array $items)`: Append multiple items.
- `getItems()`: Get the array of items.
- `toArray()`: Get items as array.
