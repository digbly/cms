<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Actions\Customize\UpdateCustomize;
use Modules\Admin\Enums\ThemePermission;
use Modules\Admin\Http\Controllers\Web\Concerns\AuthorizesAdmin;
use Modules\Admin\Http\Requests\Admin\Customize\SettingRequest;
use Modules\Admin\Support\CustomizeCatalog;
use Modules\Admin\Support\MediaPreviewResolver;

class CustomizeController extends Controller
{
    use AuthorizesAdmin;

    public function index(Request $request, CustomizeCatalog $catalog): Response
    {
        $customize = $catalog->index();
        $settings = $customize['settings']['setting'] ?? [];

        $previews = app(MediaPreviewResolver::class)->byId([
            $settings['logo'] ?? null,
            $settings['favicon'] ?? null,
        ]);

        return Inertia::render('Admin::customize/Index', [
            ...$customize,
            ...$catalog->widgets(),
            'media' => [
                'logo' => $previews[$settings['logo'] ?? ''] ?? null,
                'favicon' => $previews[$settings['favicon'] ?? ''] ?? null,
            ],
            'abilities' => [
                'update' => $this->allows($request, ThemePermission::Update->value),
            ],
        ]);
    }

    public function update(SettingRequest $request): RedirectResponse
    {
        $data = $request->validated();

        app(UpdateCustomize::class)->handle(
            $data['setting'] ?? [],
            $data['theme_setting'] ?? [],
            $data['locale'] ?? app()->getLocale(),
            $request->has('blocks') ? (array) $request->input('blocks', []) : null,
            $request->has('widgets') ? (array) $request->input('widgets', []) : null,
        );

        return back()->with('success', __('admin.customize.notices.saved'));
    }

    /**
     * JSON feed of a page's blocks, fetched when the homepage picker changes.
     */
    public function pageBlocks(string $page): JsonResponse
    {
        return response()->json(app(CustomizeCatalog::class)->pageBlocks($page));
    }
}
