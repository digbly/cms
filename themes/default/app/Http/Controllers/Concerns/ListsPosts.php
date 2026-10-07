<?php

namespace Themes\Default\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Modules\Blog\Models\Post;

trait ListsPosts
{
    /**
     * Relations the public post views need. Kept in one place so every listing
     * (home, search, category) eager loads exactly the same graph.
     *
     * @return list<string>
     */
    protected function postRelations(): array
    {
        return ['translations', 'categories.translations', 'author'];
    }

    /**
     * Base query for post listings: published posts with the relations the
     * public views need.
     *
     * @return Builder<Post>
     */
    protected function publishedPostsQuery(): Builder
    {
        return Post::query()
            ->published()
            ->with($this->postRelations());
    }
}
