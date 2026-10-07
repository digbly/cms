<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Enums\PageStatus;
use App\Http\Controllers\Controller;
use App\Models\Pages\Page;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Enums\PagePermission;
use Modules\Admin\Http\Controllers\Web\Concerns\AuthorizesAdmin;
use Modules\Admin\Http\Requests\Admin\IndexPageRequest;
use Modules\Admin\Http\Requests\Admin\PageRequest;
use Modules\Admin\Http\Resources\PageResource;

class PageController extends Controller
{
    use AuthorizesAdmin;

    public function index(IndexPageRequest $request): Response
    {
        $filters = $request->validated();

        $pages = Page::query()
            ->withTranslation()
            ->when(
                $filters['search'] ?? null,
                fn (Builder $query, string $search) => $query->whereHas(
                    'translations',
                    fn (Builder $query) => $query->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                )
            )
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->orderByDesc('created_at')
            ->paginate((int) ($filters['per_page'] ?? 15))
            ->withQueryString();

        return Inertia::render('Admin::pages/Index', [
            'title' => __('admin.pages.title'),
            'pages' => PageResource::collection($pages),
            'filters' => [
                'search' => $filters['search'] ?? null,
                'status' => $filters['status'] ?? null,
            ],
            'abilities' => [
                'create' => $this->allows($request, PagePermission::Create->value),
                'update' => $this->allows($request, PagePermission::Update->value),
                'delete' => $this->allows($request, PagePermission::Delete->value),
            ],
        ]);
    }

    public function store(PageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $page = Page::create([
            'status' => $data['status'] ?? PageStatus::Published->value,
            'template' => $data['template'] ?? null,
        ]);

        $page->fillTranslation($data['locale'] ?? app()->getLocale(), $data);

        return back()->with('success', __('admin.pages.notices.created'));
    }

    public function update(PageRequest $request, Page $page): RedirectResponse
    {
        $data = $request->validated();

        $page->status = $data['status'] ?? $page->status?->value ?? PageStatus::Published->value;

        if (array_key_exists('template', $data)) {
            $page->template = $data['template'];
        }

        $page->save();

        $page->fillTranslation($data['locale'] ?? app()->getLocale(), $data);

        return back()->with('success', __('admin.pages.notices.updated'));
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return back()->with('success', __('admin.pages.notices.deleted'));
    }
}
