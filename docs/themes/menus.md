# Menus and Navigation

Juzaweb CMS provides contracts to manage menus in both the Admin Panel and the Frontend.

## Navigation Menu (`NavMenu`)

The `Juzaweb\Modules\Core\Contracts\NavMenu` contract manages frontend navigation menu locations (e.g., Primary Menu, Footer Menu).

### Usage

```php
use Juzaweb\Modules\Core\Facades\NavMenu;

// Register a navigation menu location
NavMenu::make('primary', function () {
    return [
        'label' => 'Primary Menu',
    ];
});
```

### Methods

- `make(string $key, callable $callback)`: Register a nav menu location. Callback must return an array.
- `get(string $key)`: Get a specific nav menu.
- `all()`: Get all registered nav menus.

## Menu Box (`MenuBox`)

The `Juzaweb\Modules\Core\Contracts\MenuBox` contract allows registering custom boxes for the Menu Editor in the Admin Panel (e.g., adding "Categories" or "Custom Links" to the menu builder).

### Usage

```php
use Juzaweb\Modules\Core\Facades\MenuBox;

MenuBox::make('custom_link', 'CustomLinkClass', function () {
    return [
        'title' => 'Custom Links',
    ];
});
```

### Methods

- `make(string $key, string $class, callable $options)`: Register a menu box. Options callback must return an array.
- `get(string $position)`: Get menu boxes by position.
- `all()`: Get all registered menu boxes.
