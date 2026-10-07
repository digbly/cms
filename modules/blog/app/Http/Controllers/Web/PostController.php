<?php

namespace Modules\Blog\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Http\Controllers\Web\Concerns\AuthorizesAdmin;
use Modules\Blog\Enums\Permission;
use Modules\Blog\Http\Controllers\Concerns\SyncsTranslations;
use Modules\Blog\Http\Requests\Admin\IndexPostRequest;
use Modules\Blog\Http\Requests\Admin\StorePostRequest;
use Modules\Blog\Http\Requests\Admin\UpdatePostRequest;
use Modules\Blog\Http\Resources\CategoryResource;
use Modules\Blog\Http\Resources\PostResource;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\Post;

/**
 * Inertia-facing post management.
 *
 * The mutation logic mirrors {@see \Modules\Blog\Http\Controllers\Admin\PostController}
 * (the JSON API) but returns Inertia pages and redirects instead of resources.
 */
class PostController extends Controller
{
    use AuthorizesAdmin;
    use SyncsTranslations;

    public function index(IndexPostRequest $request): Response
    {
        $filters = $request->validated();

        $posts = Post::query()
            ->with($this->resourceRelations())
            ->when(
                $filters['search'] ?? null,
                fn (Builder $query, string $search) => $query->whereHas(
                    'translations',
                    fn (Builder $query) => $query->where('title', 'like', "%{$search}%")
                )
            )
            ->when(
                $filters['status'] ?? null,
                fn (Builder $query, string $status) => $query->where('status', $status)
            )
            ->when(
                $filters['category'] ?? null,
                fn (Builder $query, string $category) => $query->whereHas(
                    'categories',
                    fn (Builder $query) => $query->where('post_categories.id', $category)
                )
            )
            ->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')
            ->paginate((int) ($filters['per_page'] ?? 10))
            ->withQueryString();

        return Inertia::render('Blog::posts/Index', [
            'title' => __('blog.posts.title'),
            'posts' => PostResource::collection($posts),
            'filters' => [
                'search' => $filters['search'] ?? null,
                'status' => $filters['status'] ?? null,
            ],
            'abilities' => $this->abilities($request),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Blog::posts/Form', [
            'title' => __('blog.posts.form.createTitle'),
            'post' => null,
            'categories' => CategoryResource::collection($this->categoryOptions())->resolve(),
        ]);
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('Blog::posts/Form', [
            'title' => __('blog.posts.form.editTitle'),
            'post' => PostResource::make($post->load($this->resourceRelations()))->resolve(),
            'categories' => CategoryResource::collection($this->categoryOptions())->resolve(),
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $data): void {
            $post = Post::create([
                'status' => $data['status'],
                'user_id' => $data['user_id'] ?? $request->user()->getKey(),
            ]);

            $this->syncTranslations($post, $data['translations']);
            $post->categories()->sync($data['categories'] ?? []);
        });

        return redirect()
            ->route('admin.blog.posts.index')
            ->with('success', __('blog.posts.notices.created'));
    }

    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $post, $data): void {
            $post->update([
                'status' => $data['status'] ?? $post->status->value,
                'user_id' => $request->has('user_id') ? $data['user_id'] : $post->user_id,
            ]);

            if (isset($data['translations'])) {
                $this->syncTranslations($post, $data['translations']);
            }

            if ($request->has('categories')) {
                $post->categories()->sync($data['categories'] ?? []);
            }
        });

        return redirect()
            ->route('admin.blog.posts.index')
            ->with('success', __('blog.posts.notices.updated'));
    }

    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', __('blog.posts.notices.deleted'));
    }

    /**
     * @return Collection<int, Category>
     */
    protected function categoryOptions(): Collection
    {
        return Category::query()
            ->with('translations')
            ->withCount('posts')
            ->orderByDesc('created_at')
            ->limit(500)
            ->get();
    }

    /**
     * @return array<string, bool>
     */
    protected function abilities(Request $request): array
    {
        return [
            'create' => $this->allows($request, Permission::PostsCreate->value),
            'update' => $this->allows($request, Permission::PostsUpdate->value),
            'delete' => $this->allows($request, Permission::PostsDelete->value),
        ];
    }

    /**
     * @return list<string>
     */
    protected function resourceRelations(): array
    {
        return ['translations', 'categories.translations', 'author'];
    }
}
