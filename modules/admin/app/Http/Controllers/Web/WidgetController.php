<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Facades\Sidebar;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Actions\Widget\UpdateSidebarWidgets;
use Modules\Admin\Enums\WidgetPermission;
use Modules\Admin\Http\Controllers\Web\Concerns\AuthorizesAdmin;
use Modules\Admin\Http\Requests\Admin\WidgetUpdateRequest;
use Modules\Admin\Support\WidgetCatalog;

class WidgetController extends Controller
{
    use AuthorizesAdmin;

    public function index(Request $request, WidgetCatalog $catalog): Response
    {
        return Inertia::render('Admin::widgets/Index', [
            'title' => __('admin.widgets.title'),
            ...$catalog->payload(),
            'abilities' => [
                'update' => $this->allows($request, WidgetPermission::Update->value),
            ],
        ]);
    }

    public function update(WidgetUpdateRequest $request, string $sidebar): RedirectResponse
    {
        abort_if(Sidebar::get($sidebar) === null, 404);

        app(UpdateSidebarWidgets::class)->handle(
            $sidebar,
            $request->input('content', []),
            $request->validated('locale') ?? app()->getLocale(),
            theme_name(),
        );

        return back()->with('success', __('admin.widgets.notices.saved'));
    }
}
