<?php

namespace Modules\Blog\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Modules\Blog\Models\Post;

/**
 * Increment a post's view counter outside the request lifecycle so a heavily
 * read post does not issue a synchronous UPDATE on every page view.
 */
class IncrementPostViews implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $postId) {}

    public function handle(): void
    {
        Post::query()->whereKey($this->postId)->increment('views');
    }
}
