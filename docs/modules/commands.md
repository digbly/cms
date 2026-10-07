# Modules — Commands

## Module commands

Provided by `nwidart/laravel-modules`:

```bash
php artisan module:list                 # List modules
php artisan module:make <name>          # Scaffold a module
php artisan module:enable <name>        # Enable a module
php artisan module:disable <name>       # Disable a module
```

Module activation is persisted by the configured activator
(`MODULES_ACTIVATOR`, default `database`).

## Application commands

```bash
php artisan make:user --super-admin     # Create a (super admin) user
php artisan permission:generate         # Sync permissions from the registry
```

## Build, test, style

```bash
npm run build                           # Build the admin Inertia front end
php artisan test                        # Run the test suites
vendor/bin/pint                         # Format PHP (PSR-12)
```

## See also

- [Theme Commands](../themes/commands.md)
- [Make CRUD](crud.md)
