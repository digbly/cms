<?php

namespace Themes\Default\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Inertia\Response;
use Modules\Blog\Models\Category;
use Themes\Default\Http\Controllers\Concerns\ListsPosts;
use Themes\Default\Support\PostPresenter;

class CategoryController extends Controller
{
    use ListsPosts;

    public function show(string $slug): Response
    {
        $category = Category::query()
            ->with('translations')
            ->whereHas('translations', fn (Builder $query) => $query->where('slug', $slug))
            ->firstOrFail();

        $posts = $category->posts()
            ->published()
            ->with($this->postRelations())
            ->latest()
            ->paginate((int) config('default.per_page', 9))
            ->through(fn ($post) => PostPresenter::post($post));

        $translation = $category->resolvedTranslation();

        return $this->render('Category', [
            'category' => PostPresenter::category($category),
            'posts' => $posts,
            'heading' => $translation?->name ?? $category->getKey(),
            'subheading' => $translation?->description,
        ]);
    }
}
