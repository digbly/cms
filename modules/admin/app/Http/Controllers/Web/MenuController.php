<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Menus\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Actions\Menu\UpdateMenu;
use Modules\Admin\Enums\MenuPermission;
use Modules\Admin\Http\Controllers\Web\Concerns\AuthorizesAdmin;
use Modules\Admin\Http\Requests\Admin\MenuRequest;
use Modules\Admin\Http\Resources\MenuResource;
use Modules\Admin\Support\MenuCatalog;

class MenuController extends Controller
{
    use AuthorizesAdmin;

    public function index(Request $request, MenuCatalog $catalog): Response
    {
        $menus = Menu::withDataItems()->orderBy('name')->get();

        return Inertia::render('Admin::menus/Index', [
            'title' => __('admin.menus.title'),
            'menus' => MenuResource::collection($menus)->resolve(),
            'boxes' => $catalog->boxes(),
            'locations' => $catalog->locations(),
            'selectedMenuId' => $request->query('menu'),
            'abilities' => [
                'create' => $this->allows($request, MenuPermission::Create->value),
                'update' => $this->allows($request, MenuPermission::Update->value),
                'delete' => $this->allows($request, MenuPermission::Delete->value),
            ],
        ]);
    }

    /**
     * JSON feed of the items available inside a builder box (session-authenticated).
     */
    public function boxItems(string $box, Request $request): JsonResponse
    {
        return response()->json([
            'results' => app(MenuCatalog::class)->boxItems($box, $request->string('q')->toString()),
        ]);
    }

    public function store(MenuRequest $request): RedirectResponse
    {
        $menu = Menu::create([
            'name' => $request->validated('name'),
        ]);

        return redirect()
            ->route('admin.menus.index', ['menu' => $menu->getKey()])
            ->with('success', __('admin.menus.notices.created'));
    }

    public function update(MenuRequest $request, Menu $menu): RedirectResponse
    {
        app(UpdateMenu::class)->handle(
            $menu,
            $request->validated('name'),
            json_decode($request->validated('content'), true, 512, JSON_THROW_ON_ERROR),
            $request->validated('locale') ?? app()->getLocale(),
            $request->has('location') ? (array) $request->input('location', []) : null,
        );

        return back()->with('success', __('admin.menus.notices.updated'));
    }

    public function destroy(Menu $menu): RedirectResponse
    {
        $menu->delete();

        return back()->with('success', __('admin.menus.notices.deleted'));
    }
}
