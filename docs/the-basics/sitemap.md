# Sitemap

The public site exposes an XML sitemap built on `spatie/laravel-sitemap`. A
single **sitemap index** (`sitemap.xml`) points at one sub-sitemap per content
source, so the index stays small even when a provider holds thousands of rows.

Content sources are **registered in code** by the owning module or theme through
the `App\Facades\Sitemap` facade, and each source is an Eloquent model that
implements the `App\Contracts\Sitemapable` interface.

## Routes

| URL | Route name | Purpose |
| --- | --- | --- |
| `GET /sitemap.xml` | `sitemap.xml` | The sitemap index. |
| `GET /sitemap/home.xml` | `sitemap.pages` | Fixed page groups (only `home` today). |
| `GET /sitemap/{provider}/page-{page}.xml` | `sitemap.provider` | A provider's URLs, paginated. |

All three return `Content-Type: text/xml`. The provider and page segments are
constrained to `[a-z0-9\-]+` and `[0-9]+`, so an unknown segment returns a 404.

## How the index is built

`Modules\Admin\Http\Controllers\Web\SitemapController::index()` adds:

1. One `home` entry (`sitemap.pages` → `/sitemap/home.xml`), stamped with the
   homepage's `updated_at` when a homepage exists.
2. One entry per registered provider, per page.

For each registered provider the controller:

- skips the entry if the class does not exist or does not implement
  `Sitemapable`;
- counts the rows returned by the provider's `forSitemap()` scope and skips the
  provider entirely when there are none;
- splits the count into pages of `ITEMS_PER_PAGE` (500) and emits one
  sub-sitemap URL per page, stamped with the page's newest `updated_at`;
- catches any `Throwable` while counting so a single broken provider cannot
  break the whole index.

```xml
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>https://example.com/sitemap/home.xml</loc>
    </sitemap>
    <sitemap>
        <loc>https://example.com/sitemap/posts/page-1.xml</loc>
        <lastmod>2026-01-01T00:00:00+00:00</lastmod>
    </sitemap>
</sitemapindex>
```

## Register a sitemap provider

Register the **model class** from a service provider's `boot()`:

```php
use App\Facades\Sitemap;
use Modules\Blog\Models\PostTranslation;

protected function registerSitemaps(): void
{
    Sitemap::register('post-categories', CategoryTranslation::class);
    Sitemap::register('posts', PostTranslation::class);
}
```

The first argument is the provider key used in the URL
(`/sitemap/posts/page-1.xml`); the second is a `Sitemapable` model. Keys must be
globally unique — prefix them when a name could collide across modules.

The repository is bound as a singleton in `AppServiceProvider`:

```php
$this->app->singleton(SitemapContract::class, SitemapRepository::class);
```

`App\Support\SitemapRepository` stores the `key => class` map and exposes
`register()`, `all()` and `get()`.

## Make a model sitemapable

A provider model implements `App\Contracts\Sitemapable` (which extends Spatie's
contract) and uses the `App\Traits\HasSitemap` trait:

```php
use App\Contracts\Sitemapable;
use App\Traits\HasSitemap;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class PostTranslation extends Model implements Sitemapable
{
    use HasSitemap;

    public function scopeForSitemap(Builder $builder): Builder
    {
        return $builder
            ->join('posts', 'posts.id', '=', 'post_translations.post_id')
            ->select(['post_translations.*'])
            ->where('posts.status', PostStatus::Published)
            ->orderBy('post_translations.updated_at', 'desc');
    }

    public function getUrl(): string
    {
        return home_url("posts/{$this->slug}", $this->locale);
    }
}
```

The interface requires two methods:

| Method | Description |
| --- | --- |
| `scopeForSitemap(Builder)` | Narrows the query to records that should be listed. Called as `Model::forSitemap()` (the trait adds the `forSitemap` scope). |
| `getUrl(): string` | Resolves the record's public URL. |

`HasSitemap` provides two defaults you can override:

- `scopeForSitemap()` — orders by `updated_at` descending and exposes every row.
- `toSitemapTag()` — returns a Spatie `Url` with `weekly` change frequency and
  priority `0.8`, using the model's `updated_at`.

Spatie calls `toSitemapTag()` on each model when building a sub-sitemap, so the
scope's ordering also determines the `lastmod` stamped on each page in the index.

## Multi-language behaviour

URLs are built with the `home_url()` helper, which honours the
`multiple_language` setting:

- In `prefix` mode the default language is unprefixed and every other language
  is served under its `{locale}` segment — `/posts/hello` and `/vi/posts/hello`.
- In single-language mode every locale resolves to the same URL.

Sitemapable **translation models** are registered (one row per locale), so each
language gets its own URL automatically.

The fixed `home` sitemap iterates `Language::codes()`, deduplicates identical
locations (single-language mode) and gives the homepage priority `1`.

## Error handling

- The index skips providers whose class is missing, that do not implement
  `Sitemapable`, or whose table is unavailable, instead of failing.
- A provider sub-sitemap that throws while querying reports the exception via
  `report()` and returns a generic `500` — internal error details are never
  leaked into the XML.
- Unknown providers, non-sitemapable models and unknown page groups return
  `404`.

## Admin integration

The sitemap is read-only and public — there is no admin screen. To add a new
content type to the sitemap, register it from the owning module's service
provider (see `AdminServiceProvider::registerSitemaps()` and
`BlogServiceProvider::registerSitemaps()`) and make its translation model
`Sitemapable`.

## Conventions

- Register providers from the owning module's service provider during `boot()`.
- Always register the **translation** model so localized URLs are emitted.
- Override `scopeForSitemap()` to publish only visible records (e.g. published
  posts and pages); never expose drafts.
- Keep keys unique across modules — prefix with the owner when a name could
  collide.
- Build URLs with `home_url()` so language-prefix behaviour stays consistent.
