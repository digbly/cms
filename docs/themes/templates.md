# Themes — Templates & Blocks

A theme may ship its own self-contained Inertia (React) front end instead of
Blade pages. The bundled `default` theme is the reference implementation.

## Inertia front end

```
themes/default/
  resources/
    views/
      theme.blade.php            # Inertia root, guarded @vite('resources/views/app.tsx', 'themes/default')
      app.tsx                    # createInertiaApp entry (client)
      ssr.tsx                    # Inertia SSR server entry
      lib/resolve-page.ts        # resolves pages/**/*.tsx
      lib/route.ts               # SSR-safe route() helper
      pages/                     # Home, Category, Post, Search, NotFound
      layouts/ components/       # layout, sidebar, widgets, blocks, comments
    assets/css/app.css           # Tailwind entry (imported by app.tsx)
```

Like module views, the theme keeps its React pages and components alongside its
Blade templates under `resources/views` (`pages/**/*.tsx`). Blade only compiles
`.blade.php`, so the two coexist safely.

- Controllers return `Inertia::render('Home', [...])` and call
  `->rootView('default::theme')` so the theme renders its own root template.
  The theme root view uses a distinct name (`theme.blade.php`) so it never
  shadows the application's `app` Inertia root view.
- Build with `php artisan theme:build default` (or `--dev` for the Vite dev
  server) — see [Asset Compilation](assets.md).

## Register templates & blocks (backend)

Register a theme's page templates and the blocks they accept from the theme
service provider's `boot()`:

```php
use App\Facades\PageBlock;
use App\Facades\PageTemplate;
use App\Models\Pages\PageBlock as PageBlockModel;

protected function registerPageTemplates(): void
{
    PageTemplate::make('landing', fn () => [
        'label' => __('default::messages.page_template_landing'),
        'blocks' => [
            'content' => __('default::messages.page_container_content'),
        ],
    ]);
}

protected function registerPageBlocks(): void
{
    PageBlock::make('hero', fn () => [
        'label' => __('default::messages.page_block_hero'),
        'component' => 'Blocks/Hero',
    ]);

    PageBlock::make('posts', fn () => [
        'label' => __('default::messages.page_block_posts'),
        'component' => 'Blocks/Posts',
        'data' => fn (PageBlockModel $block, array $data): array => [
            'posts' => $this->presentPosts($this->postsForBlock($data)),
        ],
    ]);
}
```

A template's `blocks` maps each **container key** to its label; a block's
`component` is the frontend key the theme's `BlockRenderer` switches on. Register
them from the theme provider so an inactive theme contributes neither.

## Blocks

Page blocks and widgets registered with a `component` (and an optional `data`
resolver) are resolved to a JSON payload and rendered client-side. See
[Pages, Templates & Blocks](../the-basics/pages.md) for the backend registries
and the `BlockRenderer` contract.

```php
// backend
$containers = app(PageBlockRenderer::class)->payload($page);
// ['content' => [ ['id' => ..., 'key' => 'posts', 'component' => 'Blocks/Posts', 'data' => [...]] ]]
```

The theme resolves each block by its `component` key in
`resources/views/components/BlockRenderer.tsx`.

## See also

- [Pages, Templates & Blocks](../the-basics/pages.md)
- [Widgets](widgets.md) · [Asset Compilation](assets.md)
