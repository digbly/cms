# Permission Manager

The `PermissionManager` singleton manages the registration and retrieval of permissions within the system. It replaces valid database storage for defining permissions, allowing them to be defined in code.

## Basic Usage

### Registering Permissions manually

You can register permissions using the `make` method.

```php
use Juzaweb\Modules\Core\Facades\PermissionManager;

PermissionManager::make(
    'users.create',
    fn() => [
        'name' => 'Create users',
        'group' => 'users',
        'code' => 'users.create',
    ]
);
```

### Retrieving Permissions

To get all registered permissions:

```php
use Juzaweb\Modules\Core\Facades\PermissionManager;

$permissions = PermissionManager::getPermissions();
```

## Checking Permissions

Once permissions are registered and assigned to users, you can check if a user has a specific permission using Laravel's authorization features.

### Using `can()` Method

Check if the current authenticated user has a permission:

```php
use Illuminate\Support\Facades\Auth;

if (Auth::user()->can('users.create')) {
    // User has permission to create users
}

// Or using the auth() helper
if (auth()->user()->can('users.create')) {
    // User has permission
}

// Check on a specific user instance
$user = User::find(1);
if ($user->can('users.create')) {
    // User has permission
}
```

### Using `cannot()` Method

Check if a user does NOT have a permission:

```php
if (auth()->user()->cannot('users.delete')) {
    // User does not have permission to delete users
    abort(403, 'Unauthorized action.');
}
```

### Using `authorize()` Method

In controllers, use the `authorize()` method to automatically deny access (throws 403 exception):

```php
public function create()
{
    $this->authorize('users.create');

    // Continue with the logic if authorized
}
```

### Using In Route

Juzaweb provides a convenient `permission()` macro for protecting routes. This macro automatically registers the permission in the `PermissionManager` and applies the permission middleware:

```php
use Illuminate\Support\Facades\Route;

Route::get('/users/create', [UserController::class, 'create'])
    ->permission('users.create');

// Multiple permissions (user must have all)
Route::get('/admin/settings', [SettingsController::class, 'index'])
    ->permission(['settings.view', 'settings.edit']);
```

### Using `@can` Directive in Blade

In Blade templates, use the `@can` directive to conditionally display content:

```blade
@can('users.create')
    <a href="{{ route('users.create') }}" class="btn btn-primary">
        Create New User
    </a>
@endcan

@cannot('users.delete')
    <p>You do not have permission to delete users.</p>
@endcannot

@canany(['users.edit', 'users.delete'])
    <div class="user-actions">
        <!-- Show user action buttons -->
    </div>
@endcanany
```

### Checking Multiple Permissions

Check if a user has any or all of the given permissions:

```php
// Check if user has ANY of the permissions
if (auth()->user()->canAny(['users.create', 'users.edit'])) {
    // User has at least one of these permissions
}

// Check if user has ALL permissions manually
$user = auth()->user();
if ($user->can('users.create') && $user->can('users.edit')) {
    // User has both permissions
}
```

### Using Gate Facade

You can also use the `Gate` facade for more complex authorization logic:

```php
use Illuminate\Support\Facades\Gate;

if (Gate::allows('users.create')) {
    // Current user can create users
}

if (Gate::denies('users.delete')) {
    // Current user cannot delete users
}

// Check for a specific user
if (Gate::forUser($user)->allows('users.create')) {
    // Specific user can create users
}
```
