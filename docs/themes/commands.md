# Themes — Theme Commands

```bash
php artisan theme:list                 # all themes + status
php artisan theme:list --only=enabled  # filter by status
php artisan theme:make blog            # scaffold themes/Blog + enable it
php artisan theme:make blog --disabled # scaffold without enabling
php artisan theme:make blog --force    # overwrite an existing theme
php artisan theme:make blog --no-dump  # skip composer dump-autoload
php artisan theme:enable Blog
php artisan theme:disable Blog
php artisan theme:publish              # copy every theme's resources/assets
php artisan theme:publish Blog --force # clean + republish one theme
php artisan theme:build default        # build a theme's Inertia front end (Vite)
php artisan theme:build default --dev  # run the theme's Vite dev server
php artisan theme:ssr default          # start the theme's Inertia SSR server
```

`theme:make` scaffolds a full Inertia (React) front end: `theme.json`,
`composer.json`, `package.json`, `vite.config.js`, `tsconfig.json`,
`app/Providers/ThemeServiceProvider.php`, `resources/views/theme.blade.php`,
`resources/views/app.tsx`, a server-side-rendering entry
`resources/views/ssr.tsx`, the client helpers (`lib/resolve-page.ts`,
`lib/route.ts`), a `pages/Home.tsx`, `config/config.php`, `routes/web.php` and
`resources/assets/css/app.css`. It then runs `composer dump-autoload` so the new
theme's PSR-4 mapping is registered. Stubs live in `resources/stubs/themes`.

## See also

- [Asset Compilation](assets.md) · [Information](information.md)
- [Modules — Commands](../modules/commands.md)
