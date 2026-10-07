<?php

namespace Themes\Default\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\Post;

class SidebarData
{
    /**
     * @return Collection<int, Category>
     */
    public function categories(int $limit = 100): Collection
    {
        return Category::query()
            ->with('translations')
            ->withCount(['posts' => fn (Builder $query) => $query->published()])
            ->orderBy('created_at')
            ->limit(max(1, $limit))
            ->get();
    }

    /**
     * @return Collection<int, Post>
     */
    public function recent(int $limit = 5): Collection
    {
        return Post::query()
            ->published()
            ->with('translations')
            ->latest()
            ->orderBy('id')
            ->limit(max(1, $limit))
            ->get();
    }

    /**
     * @return Collection<int, Post>
     */
    public function popular(int $limit = 5): Collection
    {
        return Post::query()
            ->published()
            ->with('translations')
            ->orderByDesc('views')
            ->latest()
            ->orderBy('id')
            ->limit(max(1, $limit))
            ->get();
    }
}
