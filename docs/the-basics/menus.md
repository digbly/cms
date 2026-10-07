# Menus and Navigation

Juzaweb CMS provides contracts to manage menus in both the Admin Panel and the Frontend.

## Admin Menu (`Menu`)

The `Juzaweb\Modules\Core\Contracts\Menu` contract allows you to manage the Admin Panel's sidebar menu.

### Usage

```php
use Juzaweb\Modules\Core\Facades\Menu;

// Register a new menu item
Menu::make('posts', function () {
    return [
        'title' => 'Posts',
        'icon' => 'fa fa-edit',
        'url' => 'posts',
        'priority' => 20,
    ];
});
```

### Methods

- `make(string $key, callable $callback)`: Register a menu item. Callback must return an array.
- `get(string $key)`: Get a specific menu item configuration.
- `getByPosition(string $position)`: Get menus by position (key).
- `all()`: Get all registered menus.

### Menu Positions

The `position` key in the menu configuration array determines where the menu item will be displayed. This allows you to add menu items to various locations in the Admin Panel.

- `admin-left`: (Default) The main sidebar menu on the left.
- `admin-top-profile`: The dropdown menu under the user profile in the top navbar.
- `admin-sidebar-profile`: The menu list inside the user profile sidebar page.

**Example Usage:**

```php
Menu::make('profile', function () {
    return [
        'title' => 'Profile',
        'icon' => 'fas fa-user',
        'url' => 'profile',
        'position' => 'admin-top-profile', // Specify position here
        'priority' => 10,
    ];
});
```