<?php

namespace App\Models\Pages;

use App\Contracts\Sitemapable;
use App\Enums\PageStatus;
use App\Traits\HasSitemap;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageTranslation extends Model implements Sitemapable
{
    use HasSitemap;

    protected $table = 'page_translations';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'description',
        'locale',
        'page_id',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id', 'id');
    }

    public function scopeForSitemap(Builder $builder): Builder
    {
        return $builder
            ->join('pages', 'pages.id', '=', 'page_translations.page_id')
            ->select(['page_translations.*'])
            ->where('pages.status', PageStatus::Published)
            ->when(
                theme_setting('home_page'),
                fn (Builder $query, $homeId) => $query->where('pages.id', '!=', $homeId)
            )
            ->orderBy('page_translations.updated_at', 'desc');
    }

    public function getUrl(): string
    {
        return home_url($this->slug, $this->locale);
    }
}
