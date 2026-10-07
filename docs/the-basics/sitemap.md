# Sitemap

Juzaweb CMS uses the `Sitemap` facade (mapped to `Juzaweb\Modules\Core\Contracts\Sitemap`) to manage XML sitemaps. It integrates with Spatie's Sitemap package but adds a registry system for modules.

## Usage

```php
use Juzaweb\Modules\Core\Facades\Sitemap;
```

## Methods

### register($key, $class)

Register a new sitemap provider. The class must implement `Juzaweb\Modules\Core\Contracts\Sitemapable`.

```php
use Juzaweb\Modules\Core\Facades\Sitemap;

public function boot()
{
    Sitemap::register('posts', \Juzaweb\Modules\Blog\Models\Post::class);
}
```

### all()

Get all registered sitemap providers.

```php
$providers = Sitemap::all();
```

### get($key)

Get a specific sitemap provider class by key.

```php
$class = Sitemap::get('posts');
```

## Implementing Sitemapable

To make a Model or Class compatible with the Sitemap system, implement the `Juzaweb\Modules\Core\Contracts\Sitemapable` interface.

```php
namespace Juzaweb\Modules\Blog\Models;

use Juzaweb\Modules\Core\Models\Model;
use Juzaweb\Modules\Core\Contracts\Sitemapable;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Sitemap\Tags\Url;

class Post extends Model implements Sitemapable
{
    /**
     * Query scope for sitemap generation.
     */
    public function scopeForSitemap(Builder $builder): Builder
    {
        return $builder->where('status', 'publish');
    }

    /**
     * Get the URL for the sitemap item.
     */
    public function getUrl(): string
    {
        return route('post.detail', [$this->slug]);
    }

    /**
     * Get the sitemap page name (group).
     */
    public static function getSitemapPage(): string
    {
        return 'posts';
    }

    /**
     * Map the model to a Sitemap Tag (Spatie).
     */
    public function toSitemapTag(): Url|string|array
    {
        return Url::create($this->getUrl())
            ->setLastModificationDate($this->updated_at)
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_DAILY)
            ->setPriority(0.8);
    }
}
```
