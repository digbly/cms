<?php

use Illuminate\Support\Facades\Route;
use Modules\Admin\Http\Middleware\RequireAdminPermission;
use Modules\Blog\Enums\Permission;
use Modules\Blog\Http\Controllers\Web\CategoryController;
use Modules\Blog\Http\Controllers\Web\CommentController;
use Modules\Blog\Http\Controllers\Web\PostController;

/*
|--------------------------------------------------------------------------
| Blog Admin Web Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:web'])
    ->prefix(config('app.admin_prefix', 'admin'))
    ->group(function () {
        Route::prefix('blog')
            ->name('admin.blog.')
            ->group(function () {
                Route::prefix('posts')->name('posts.')->group(function () {
                    Route::get('/', [PostController::class, 'index'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::PostsView->value)
                        ->name('index');
                    Route::get('create', [PostController::class, 'create'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::PostsCreate->value)
                        ->name('create');
                    Route::post('/', [PostController::class, 'store'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::PostsCreate->value)
                        ->name('store');
                    Route::get('{post}/edit', [PostController::class, 'edit'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::PostsUpdate->value)
                        ->name('edit');
                    Route::match(['put', 'patch'], '{post}', [PostController::class, 'update'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::PostsUpdate->value)
                        ->name('update');
                    Route::delete('{post}', [PostController::class, 'destroy'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::PostsDelete->value)
                        ->name('destroy');
                });

                Route::prefix('categories')->name('categories.')->group(function () {
                    Route::get('/', [CategoryController::class, 'index'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CategoriesView->value)
                        ->name('index');
                    Route::get('create', [CategoryController::class, 'create'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CategoriesCreate->value)
                        ->name('create');
                    Route::post('/', [CategoryController::class, 'store'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CategoriesCreate->value)
                        ->name('store');
                    Route::get('{category}/edit', [CategoryController::class, 'edit'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CategoriesUpdate->value)
                        ->name('edit');
                    Route::match(['put', 'patch'], '{category}', [CategoryController::class, 'update'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CategoriesUpdate->value)
                        ->name('update');
                    Route::delete('{category}', [CategoryController::class, 'destroy'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CategoriesDelete->value)
                        ->name('destroy');
                });

                Route::prefix('comments')->name('comments.')->group(function () {
                    Route::get('/', [CommentController::class, 'index'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CommentsView->value)
                        ->name('index');
                    Route::match(['put', 'patch'], '{comment}', [CommentController::class, 'update'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CommentsUpdate->value)
                        ->name('update');
                    Route::delete('{comment}', [CommentController::class, 'destroy'])
                        ->middleware(RequireAdminPermission::class.':'.Permission::CommentsDelete->value)
                        ->name('destroy');
                });
            });
    });
