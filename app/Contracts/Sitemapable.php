<?php

namespace App\Contracts;

use Illuminate\Database\Eloquent\Builder;
use Spatie\Sitemap\Contracts\Sitemapable as BaseSitemapable;

interface Sitemapable extends BaseSitemapable
{
    /**
     * Scope the query down to the records that should appear in the sitemap.
     */
    public function scopeForSitemap(Builder $builder): Builder;

    /**
     * Resolve the public URL of the record.
     */
    public function getUrl(): string;
}
