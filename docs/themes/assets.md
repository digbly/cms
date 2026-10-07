# Themes — Asset Compilation

Theme assets are served from `public/themes/<alias>` (URL prefix configurable
via `themes.paths.assets_url`). The source of truth is
`themes/<theme>/resources/assets`; run `theme:publish <Name>` to copy it into
`public/themes/<alias>` (use `--force` to clean the destination first).

A theme's Inertia front end is built with its own Vite setup:

```bash
php artisan theme:build default        # build the theme front end (client + SSR)
php artisan theme:build default --dev  # run the theme's Vite dev server
```

The bundled `default` theme ships:

```
themes/default/
  vite.config.js                 # laravel + react + tailwind, buildDirectory themes/default
  package.json                   # vite / react / @inertiajs/react
  tsconfig.json
```

Assets land in `public/themes/default` from the theme's own Vite config; the root
template only injects them when the manifest exists.

Each theme dev server writes its own hot file to `public/themes/<alias>/hot`
(`hotFile` in the theme's `vite.config.js`) instead of the shared `public/hot`.
On theme routes `App\Http\Middleware\ThemeSsr` points Laravel's Vite instance at
that hot file, so a running application Vite server cannot load the application
front end on theme routes (and vice versa). When the theme dev server is not
running, the built manifest is used.

## Server-side rendering

Each theme may ship its own SSR bundle and server. A theme opts in through the
`ssr` key in its `theme.json`:

```json
{
    "ssr": {
        "enabled": true,
        "host": "127.0.0.1",
        "port": 13714,
        "bundle": "bootstrap/ssr/themes/default/ssr.js"
    }
}
```

Only the active theme's configuration is applied, and only on theme routes: the
`App\Http\Middleware\ThemeSsr` middleware (attached to every theme route by
`Theme::registerRoutes()`) points Inertia's SSR gateway at the active theme via
`Theme::registerSsr()`. The application's own Inertia pages are never affected.

- `enabled` — opt the theme out of SSR.
- `host` / `port` — where the theme's SSR server listens and where Inertia
  dispatches. Give every theme its own port if you run several at once.
- `bundle` — bundle path, absolute or relative to the project root. Defaults to
  `<themes.ssr.output>/<alias>/ssr.js`.

Build the client and SSR bundles with `theme:build` (the theme's `build` script
runs `vite build && vite build --ssr`), then start the server:

```bash
php artisan theme:build default
php artisan theme:ssr default
```

`theme:ssr` spawns `node bootstrap/ssr/themes/default/ssr.js` with `SSR_PORT`
and `SSR_HOST` set from the theme's `ssr.port` / `ssr.host`. The SSR entry
(`resources/views/ssr.tsx`) reads them and defaults to `13714` on `127.0.0.1`,
so the server binds to the loopback interface unless a theme opts otherwise.

Global defaults and the master switch live in `config/themes.php` under `ssr`:

- `ssr.enabled` (`THEME_SSR_ENABLED`) — when `false`, theme SSR is disabled
  regardless of `theme.json`; unset respects `inertia.ssr.enabled`.
- `ssr.host` (`THEME_SSR_HOST`) — default host.
- `ssr.output` — base directory for built per-theme bundles.

A theme that declares no `ssr` block still enables SSR by default; if its bundle
does not exist, Inertia simply falls back to client-side rendering.

## See also

- [Theme Commands](commands.md) · [Templates & Blocks](templates.md)
