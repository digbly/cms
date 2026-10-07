# Widgets & Sidebars

Juzaweb CMS supports a widget system allowing themes to define sidebars and register custom widgets.

## Sidebars (`Sidebar`)

The `Juzaweb\Modules\Core\Contracts\Sidebar` contract is used to register widget areas (sidebars) where users can drag and drop widgets.

### Usage

```php
use Juzaweb\Modules\Core\Facades\Sidebar;

// Register a sidebar
Sidebar::make('sidebar', function () {
    return [
        'label' => 'Main Sidebar',
        'description' => 'The main sidebar for blog posts.',
    ];
});
```

### Methods

- `make(string $key, callable $callback)`: Register a sidebar. Callback must return an array.
- `all()`: Get all registered sidebars.

## Widgets (`Widget`)

The `Juzaweb\Modules\Core\Contracts\Widget` contract is used to register custom widgets available for use in sidebars.

### Usage

```php
use Juzaweb\Modules\Core\Facades\Widget;

// Register a custom widget
Widget::make('recent_posts', function () {
    return [
        'label' => 'Recent Posts',
        'description' => 'Display recent posts.',
        'view' => 'theme::widgets.recent_posts.show',
        'form' => 'theme::widgets.recent_posts.form',
    ];
});
```

### Methods

- `make(string $key, callable $callback)`: Register a new widget. Callback must return an array.
- `get(string $key)`: Get a specific widget.
- `all()`: Get all registered widgets.
