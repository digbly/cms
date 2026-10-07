To update CMS version, you can run the following command.

```bash
composer update juzaweb/core
```

Update database and public assets.

```bash
php artisan migrate
php artisan vendor:publish --tag=core-assets
```
