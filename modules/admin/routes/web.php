<?php

use Illuminate\Support\Facades\Route;
use Modules\Admin\Enums\DashboardPermission;
use Modules\Admin\Enums\MediaPermission;
use Modules\Admin\Enums\MenuPermission;
use Modules\Admin\Enums\PagePermission;
use Modules\Admin\Enums\SettingPermission;
use Modules\Admin\Enums\ThemePermission;
use Modules\Admin\Enums\UserPermission;
use Modules\Admin\Enums\WidgetPermission;
use Modules\Admin\Http\Controllers\Web\CustomizeController;
use Modules\Admin\Http\Controllers\Web\DashboardController;
use Modules\Admin\Http\Controllers\Web\MediaController;
use Modules\Admin\Http\Controllers\Web\MenuController;
use Modules\Admin\Http\Controllers\Web\PageController;
use Modules\Admin\Http\Controllers\Web\SettingController;
use Modules\Admin\Http\Controllers\Web\UserController;
use Modules\Admin\Http\Controllers\Web\WidgetController;
use Modules\Admin\Http\Middleware\RequireAdminPermission;

Route::middleware(['auth:web'])
    ->prefix(config('app.admin_prefix', 'admin'))
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])
            ->middleware(RequireAdminPermission::class.':'.DashboardPermission::View->value)
            ->name('admin.dashboard');

        Route::middleware(RequireAdminPermission::class.':'.SettingPermission::Manage->value)
            ->group(function () {
                Route::get('settings', [SettingController::class, 'edit'])->name('admin.settings.edit');
                Route::put('settings', [SettingController::class, 'store'])->name('admin.settings.update');
            });

        Route::middleware(RequireAdminPermission::class.':'.UserPermission::Manage->value)
            ->prefix('users')
            ->name('admin.users.')
            ->group(function () {
                Route::get('/', [UserController::class, 'index'])->name('index');
                Route::get('create', [UserController::class, 'create'])->name('create');
                Route::post('/', [UserController::class, 'store'])->name('store');
                Route::get('{user}/edit', [UserController::class, 'edit'])->name('edit');
                Route::put('{user}', [UserController::class, 'update'])->name('update');
                Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
                Route::post('{user}/restore', [UserController::class, 'restore'])
                    ->withTrashed()
                    ->name('restore');
                Route::put('{user}/password', [UserController::class, 'resetPassword'])->name('password');
                Route::post('{user}/resend-verification', [UserController::class, 'resendVerification'])
                    ->name('resend-verification');
            });

        Route::prefix('media')->name('admin.media.')->group(function () {
            Route::get('/', [MediaController::class, 'index'])
                ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaView->value)
                ->name('index');
            Route::get('list', [MediaController::class, 'list'])
                ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaView->value)
                ->name('list');
            Route::post('/', [MediaController::class, 'store'])
                ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaCreate->value)
                ->name('store');
            Route::put('{media}', [MediaController::class, 'update'])
                ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaUpdate->value)
                ->name('update');
            Route::delete('{media}', [MediaController::class, 'destroy'])
                ->middleware(RequireAdminPermission::class.':'.MediaPermission::MediaDelete->value)
                ->name('destroy');
        });

        Route::prefix('pages')->name('admin.pages.')->group(function () {
            Route::get('/', [PageController::class, 'index'])
                ->middleware(RequireAdminPermission::class.':'.PagePermission::View->value)
                ->name('index');
            Route::post('/', [PageController::class, 'store'])
                ->middleware(RequireAdminPermission::class.':'.PagePermission::Create->value)
                ->name('store');
            Route::put('{page}', [PageController::class, 'update'])
                ->middleware(RequireAdminPermission::class.':'.PagePermission::Update->value)
                ->name('update');
            Route::delete('{page}', [PageController::class, 'destroy'])
                ->middleware(RequireAdminPermission::class.':'.PagePermission::Delete->value)
                ->name('destroy');
        });

        Route::prefix('menus')->name('admin.menus.')->group(function () {
            Route::get('/', [MenuController::class, 'index'])
                ->middleware(RequireAdminPermission::class.':'.MenuPermission::View->value)
                ->name('index');
            Route::post('/', [MenuController::class, 'store'])
                ->middleware(RequireAdminPermission::class.':'.MenuPermission::Create->value)
                ->name('store');
            Route::get('boxes/{box}/items', [MenuController::class, 'boxItems'])
                ->middleware(RequireAdminPermission::class.':'.MenuPermission::View->value)
                ->name('box-items');
            Route::put('{menu}', [MenuController::class, 'update'])
                ->middleware(RequireAdminPermission::class.':'.MenuPermission::Update->value)
                ->name('update');
            Route::delete('{menu}', [MenuController::class, 'destroy'])
                ->middleware(RequireAdminPermission::class.':'.MenuPermission::Delete->value)
                ->name('destroy');
        });

        Route::prefix('widgets')->name('admin.widgets.')->group(function () {
            Route::get('/', [WidgetController::class, 'index'])
                ->middleware(RequireAdminPermission::class.':'.WidgetPermission::View->value)
                ->name('index');
            Route::put('{sidebar}', [WidgetController::class, 'update'])
                ->middleware(RequireAdminPermission::class.':'.WidgetPermission::Update->value)
                ->name('update');
        });

        Route::prefix('customize')->name('admin.customize.')->group(function () {
            Route::get('/', [CustomizeController::class, 'index'])
                ->middleware(RequireAdminPermission::class.':'.ThemePermission::View->value)
                ->name('index');
            Route::post('/', [CustomizeController::class, 'update'])
                ->middleware(RequireAdminPermission::class.':'.ThemePermission::Update->value)
                ->name('update');
            Route::get('page-blocks/{page}', [CustomizeController::class, 'pageBlocks'])
                ->middleware(RequireAdminPermission::class.':'.ThemePermission::View->value)
                ->name('page-blocks');
        });
    });
