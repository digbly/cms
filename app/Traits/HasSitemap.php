<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Sitemap\Tags\Url;

/**
 * Default sitemap behaviour for a Sitemapable model.
 *
 * Usage:
 *
 *     class MyModel extends Model implements Sitemapable
 *     {
 *         use HasSitemap;
 *     }
 *
 * Models are expected to provide `getUrl()`; override `scopeForSitemap()` to
 * change which records are exposed.
 *
 * @mixin Model
 */
trait HasSitemap
{
    /**
     * Default scope: expose every record ordered by most recently updated.
     */
    public function scopeForSitemap(Builder $builder): Builder
    {
        return $builder->orderBy('updated_at', 'desc');
    }

    /**
     * Convert the model into a sitemap URL tag.
     */
    public function toSitemapTag(): Url|string|array
    {
        return Url::create($this->getUrl())
            ->setLastModificationDate($this->updated_at ?? now())
            ->setChangeFrequency(Url::CHANGE_FREQUENCY_WEEKLY)
            ->setPriority(0.8);
    }
}
