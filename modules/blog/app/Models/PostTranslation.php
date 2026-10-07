<?php

namespace Modules\Blog\Models;

use App\Contracts\Sitemapable;
use App\Traits\HasSitemap;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Blog\Enums\PostStatus;

class PostTranslation extends Model implements Sitemapable
{
    use HasSitemap;

    protected $table = 'post_translations';

    protected $fillable = [
        'title',
        'description',
        'content',
        'slug',
        'locale',
        'post_id',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'post_id');
    }

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
