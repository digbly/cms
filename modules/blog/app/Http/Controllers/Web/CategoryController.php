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
use Modules\Blog\Http\Requests\Admin\IndexCategoryRequest;
use Modules\Blog\Http\Requests\Admin\StoreCategoryRequest;
use Modules\Blog\Http\Requests\Admin\UpdateCategoryRequest;
use Modules\Blog\Http\Resources\CategoryResource;
use Modules\Blog\Models\Category;

/**
 * Inertia-facing category management.
 *
 * Mirrors {@see \Modules\Blog\Http\Controllers\Admin\CategoryController} for
 * the web surface.
 */
class CategoryController extends Controller
{
    use AuthorizesAdmin;
    use SyncsTranslations;

    public function index(IndexCategoryRequest $request): Response
    {
        $filters = $request->validated();

        $categories = Category::query()
            ->with('translations')
            ->withCount('posts')
            ->when(
                $filters['search'] ?? null,
                fn (Builder $query, string $search) => $query->whereHas(
                    'translations',
                    fn (Builder $query) => $query->where('name', 'like', "%{$search}%")
                )
            )
            ->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')
            ->paginate((int) ($filters['per_page'] ?? 20))
            ->withQueryString();

        return Inertia::render('Blog::categories/Index', [
            'title' => __('blog.categories.title'),
            'categories' => CategoryResource::collection($categories),
            'filters' => [
                'search' => $filters['search'] ?? null,
            ],
            'abilities' => $this->abilities($request),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Blog::categories/Form', [
            'title' => __('blog.categories.form.createTitle'),
            'category' => null,
            'categories' => CategoryResource::collection($this->categoryOptions())->resolve(),
        ]);
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Blog::categories/Form', [
            'title' => __('blog.categories.form.editTitle'),
            'category' => CategoryResource::make($category->load('translations')->loadCount('posts'))->resolve(),
            'categories' => CategoryResource::collection($this->categoryOptions())->resolve(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            $category = Category::create([
                'parent_id' => $data['parent_id'] ?? null,
                'is_home' => (bool) ($data['is_home'] ?? false),
            ]);

            $this->syncTranslations($category, $data['translations']);
        });

        return redirect()
            ->route('admin.blog.categories.index')
            ->with('success', __('blog.categories.notices.created'));
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $category, $data): void {
            $category->update([
                'parent_id' => $request->has('parent_id') ? $data['parent_id'] : $category->parent_id,
                'is_home' => $request->has('is_home') ? (bool) $data['is_home'] : $category->is_home,
            ]);

            if (isset($data['translations'])) {
                $this->syncTranslations($category, $data['translations']);
            }
        });

        return redirect()
            ->route('admin.blog.categories.index')
            ->with('success', __('blog.categories.notices.updated'));
    }

    public function destroy(Category $category): RedirectResponse
    {
        $category->delete();

        return back()->with('success', __('blog.categories.notices.deleted'));
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
            'create' => $this->allows($request, Permission::CategoriesCreate->value),
            'update' => $this->allows($request, Permission::CategoriesUpdate->value),
            'delete' => $this->allows($request, Permission::CategoriesDelete->value),
        ];
    }
}
