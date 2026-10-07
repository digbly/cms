<?php

namespace Themes\Default\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Inertia\Response;
use Modules\Blog\Jobs\IncrementPostViews;
use Themes\Default\Http\Controllers\Concerns\ListsPosts;
use Themes\Default\Support\PostPresenter;

class PostController extends Controller
{
    use ListsPosts;

    public function show(string $slug): Response
    {
        $post = $this->publishedPostsQuery()
            ->whereHas('translations', fn (Builder $query) => $query->where('slug', $slug))
            ->firstOrFail();

        IncrementPostViews::dispatch($post->getKey());

        $post->views++;

        $comments = $post->comments()
            ->approved()
            ->whereNull('parent_id')
            ->with(['replies' => fn ($query) => $query->approved()->with('author')])
            ->with('author')
            ->latest()
            ->paginate((int) config('default.per_page', 20))
            ->withQueryString()
            ->through(fn ($comment) => PostPresenter::comment($comment));

        return $this->render('Post', [
            'post' => PostPresenter::post($post, true),
            'comments' => $comments,
            'commentStatus' => session('comment_status'),
        ]);
    }
}
