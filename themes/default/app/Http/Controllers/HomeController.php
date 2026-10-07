<?php

namespace Themes\Default\Http\Controllers;

use App\Facades\PageTemplate;
use App\Models\Pages\Page;
use App\Support\PageBlockRenderer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Response;
use Themes\Default\Http\Controllers\Concerns\ListsPosts;
use Themes\Default\Support\PostPresenter;

class HomeController extends Controller
{
    use ListsPosts;

    public function index(): Response
    {
        $home = Page::home();

        if ($home !== null && $home->template !== null) {
            $template = PageTemplate::get($home->template);
            $blocks = app(PageBlockRenderer::class)->payload($home);

            if ($template !== null && $blocks !== []) {
                return $this->render('Home', [
                    'heading' => __('default::messages.latest_posts'),
                    'subheading' => __('default::messages.latest_posts_subtitle'),
                    'template' => [
                        'key' => $template->key,
                        'label' => $template->get('label'),
                        'blocks' => $template->get('blocks') ?? [],
                    ],
                    'blocks' => $blocks,
                ]);
            }
        }

        $posts = $this->publishedPostsQuery()
            ->latest()
            ->paginate((int) config('default.per_page', 9))
            ->through(fn ($post) => PostPresenter::post($post));

        return $this->render('Home', [
            'heading' => __('default::messages.latest_posts'),
            'subheading' => __('default::messages.latest_posts_subtitle'),
            'posts' => $posts,
            'template' => null,
            'blocks' => [],
        ]);
    }

    public function search(Request $request): Response
    {
        $search = trim((string) $request->query('q', ''));

        $posts = $this->publishedPostsQuery()
            ->when($search !== '', fn (Builder $query) => $query->whereHas(
                'translations',
                fn (Builder $query) => $query->where('title', 'like', "%{$search}%")
            ))
            ->latest()
            ->paginate((int) config('default.per_page', 9))
            ->withQueryString()
            ->through(fn ($post) => PostPresenter::post($post));

        return $this->render('Search', [
            'search' => $search,
            'posts' => $posts,
        ]);
    }
}
