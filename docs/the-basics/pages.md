# Pages, Templates & Blocks

Themes can build dynamic pages from a template plus a list of **blocks**. A
`Page` is a translatable content record with a `status` and a `template`; its
`PageBlock` rows are placed into named **containers** defined by that template
and rendered by the theme.

## Page model

`App\Models\Pages\Page` is UUID-keyed and translatable.

```php
$page->status;     // App\Enums\PageStatus (cast)
$page->template;   // registered template key, or null
$page->blocks();   // HasMany PageBlock
Page::home();      // the page assigned as homepage, or null
```

Translated attributes: `title`, `slug`, `content`, `description`. Persist a
locale's values with `fillTranslation($locale, $data)`.

`Page::home()` reads the `home_page` [theme setting](theme-settings.md) and
returns the matching page — this is what the customizer's homepage control
writes.

## Register a page template

```php
use App\Facades\PageTemplate;

PageTemplate::make('landing', fn () => [
    'label' => __('default::messages.page_template_landing'),
    'blocks' => [
        'content' => __('default::messages.page_container_content'),
    ],
]);
```

`blocks` maps a **container key** to its human label. A page's blocks are
placed into one of these containers. `App\Support\PageTemplateRepository`
returns `App\Support\Entities\PageTemplate` objects (`key`, `label`, `blocks`).

## Register a page block

```php
use App\Facades\PageBlock;
use App\Models\Pages\PageBlock as PageBlockModel;

PageBlock::make('posts', fn () => [
    'label' => __('default::messages.page_block_posts'),
    'component' => 'Blocks/Posts',       // Inertia component key
    'data' => fn (PageBlockModel $block, array $data): array => [
        'posts' => $this->presentPosts($this->postsForBlock($data)),
    ],
]);
```

`App\Support\Entities\PageBlock` options:

| Option | Description |
| --- | --- |
| `label` | Shown in the admin block picker. |
| `form` | Optional Blade form used to edit the block's `data`. |
| `view` | Optional Blade view for HTML themes. |
| `component` | Inertia component key for client rendering. |
| `data` | Resolver `(PageBlockModel $block, array $data) => array`. |

## PageBlock model

`App\Models\Pages\PageBlock` stores each placed block:

```php
$block->page_id;
$block->block;            // registered block key
$block->data;             // array cast
$block->theme;            // owning theme alias
$block->container;        // template container key
$block->display_order;
```

Translated attributes: `label`, `fields`. It requires the matching
`PageBlockTranslation` model.

## Rendering

`App\Support\PageBlockRenderer::payload(Page $page)` groups a page's blocks by
container and resolves each one into `{ id, key, label, component, data }`:

```php
$containers = app(PageBlockRenderer::class)->payload($page);
// ['content' => [ ['id' => ..., 'key' => 'posts', 'component' => 'Blocks/Posts', 'data' => [...]] ]]
```

Blocks whose definition has no `component` are skipped, so Blade-only themes
render blocks through their `view` instead.

## Admin integration

| Route (name) | Purpose |
| --- | --- |
| `admin.pages.index` | List/filter pages (`Admin::pages/Index`). |
| `admin.pages.store` | Create a page + translation. |
| `admin.pages.update` | Update status/template + translation. |
| `admin.pages.destroy` | Delete a page. |
| `admin.customize.page-blocks` | JSON feed of a page's blocks for the customizer. |

`PageController` uses `PageRequest` for validation and `PageResource` for
serialisation. Block editing happens through the customizer
(`CustomizeCatalog::pageBlocks()` / `UpdateCustomize`), which persists
`page_blocks` rows.

## Frontend contract

An Inertia theme renders each container's payload by switching on the block
`component` key:

```tsx
// themes/<theme>/resources/views/components/BlockRenderer.tsx
switch (block.component) {
    case 'Blocks/Hero':
        return <Hero {...block.data} />;
    case 'Blocks/Posts':
        return <Posts {...block.data} />;
    default:
        return null;
}
```

The bundled `default` theme ships `Blocks/Hero` and `Blocks/Posts`, with a
`landing` template exposing a `content` container.

## Conventions

- Register templates and blocks from the theme provider — they are theme
  concerns and must disappear when the theme is inactive.
- Keep block `component` keys in sync with the theme's `BlockRenderer`.
- Resolve content in the `data` callback (server-side) so payloads stay
  serialisable and SSR-safe.
- Prefer a template + blocks for composed landing pages; use a plain `content`
  page for simple content.
