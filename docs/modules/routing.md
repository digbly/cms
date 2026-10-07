# Routing

Juzaweb CMS expands Laravel's routing with specialized macros to simplified Admin and API route registration. These macros use the `RouteResource` facade.

## Admin Config Routes

Use the `Route::admin` macro to register standard CRUD routes for the Admin Panel.

```php
use Illuminate\Support\Facades\Route;

Route::admin('posts', 'PostController');
```

This single line registers the following routes:

| Method | URI | Action | Route Name |
| :--- | :--- | :--- | :--- |
| GET | `posts` | `index` | `posts.index` |
| GET | `posts/create` | `create` | `posts.create` |
| POST | `posts` | `store` | `posts.store` |
| GET | `posts/{id}/edit` | `edit` | `posts.edit` |
| PUT | `posts/{id}` | `update` | `posts.update` |
| DELETE | `posts/{id}` | `destroy` | `posts.destroy` |
| POST | `posts/bulk` | `bulk` | `posts.bulk` |

### Customizing Admin Routes

You can chain methods to customize the generated routes (inherited from parameters or specific logic if applicable, currently standard Resource methods).

## API Routes

Use the `Route::api` macro to register RESTful API routes with built-in scope and permission handling.

```php
Route::api('posts', 'Api\PostController');
```

This registers:

| Method | URI | Action |
| :--- | :--- | :--- |
| GET | `posts` | `index` |
| GET | `posts/{id}` | `show` |
| POST | `posts` | `store` |
| PUT | `posts/{id}` | `update` |
| DELETE | `posts/{id}` | `destroy` |
| POST | `posts/bulk` | `bulk` |

### API fluent methods

The `Route::api` macro returns an `APIResource` instance, allowing you to chain methods for configuration.

#### exceptBulkAction()

Exclude the bulk action route.

```php
Route::api('posts', 'Api\PostController')->exceptBulkAction();
```

#### guestable(bool $allow = true)

Allow guest access (no authentication middleware) for specific methods.

```php
Route::api('public-posts', 'Api\PublicPostController')->guestable();
```

Diffault guest methods are `index` and `show`. You can customize this:

```php
Route::api('posts', 'Api\PostController')
    ->guestable()
    ->guestMethods(['index', 'show', 'search']);
```

#### Scopes

Customize OAuth2 scopes for read/write actions.

```php
Route::api('posts', 'Api\PostController')
    ->scopeName('posts') // Default is route name
    ->readScopes(['posts.read'])
    ->writeScopes(['posts.write']);
```
