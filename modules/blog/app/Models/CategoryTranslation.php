<?php

namespace Modules\Blog\Models;

use App\Contracts\Sitemapable;
use App\Traits\HasSitemap;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryTranslation extends Model implements Sitemapable
{
    use HasSitemap;

    protected $table = 'post_category_translations';

    protected $fillable = [
        'name',
        'description',
        'slug',
        'locale',
        'post_category_id',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'post_category_id');
    }

    public function scopeForSitemap(Builder $builder): Builder
    {
        return $builder
            ->join('post_categories', 'post_categories.id', '=', 'post_category_translations.post_category_id')
            ->select(['post_category_translations.*'])
            ->orderBy('post_category_translations.updated_at', 'desc');
    }

    public function getUrl(): string
    {
        return home_url("categories/{$this->slug}", $this->locale);
    }
}
