<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\MediaItem;
use App\Models\Pages\Page;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Auth\Models\User;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Admin::dashboard/Index', [
            'title' => __('admin.nav.dashboard'),
            'stats' => [
                ['label' => __('admin.nav.users'), 'value' => $this->userCount()],
                ['label' => __('admin.nav.pages'), 'value' => Page::query()->count()],
                ['label' => __('admin.nav.media'), 'value' => MediaItem::query()->count()],
            ],
        ]);
    }

    /**
     * Number of registered users.
     */
    protected function userCount(): int
    {
        return User::query()->count();
    }
}
