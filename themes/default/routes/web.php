<?php

use App\Http\Middleware\SetLocale;
use Illuminate\Support\Facades\Route;
use Themes\Default\Http\Controllers\CategoryController;
use Themes\Default\Http\Controllers\CommentController;
use Themes\Default\Http\Controllers\HomeController;
use Themes\Default\Http\Controllers\PageController;
use Themes\Default\Http\Controllers\PostController;

/*
|--------------------------------------------------------------------------
| Default Theme Front-end Routes
|--------------------------------------------------------------------------
|
| In `prefix` mode every language except the default is served under its
| locale segment (e.g. /vi/posts/hello); the default language stays at the
| root. In every other mode the un-prefixed routes are the only ones used.
|
*/

$frontendRoutes = function (): void {
    Route::get('/', [HomeController::class, 'index'])->name('home');
    Route::get('/search', [HomeController::class, 'search'])->name('search');

    Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('categories.show');
    Route::get('/posts/{slug}', [PostController::class, 'show'])->name('posts.show');

    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])
        ->name('comments.store')
        ->middleware('throttle:20,1');

    // Static pages resolve last so they never shadow the reserved routes above.
    Route::get('/{slug}', [PageController::class, 'show'])->name('pages.show');
};

// Locale-prefixed routes are registered first so a two-letter page slug can
// never shadow a language segment.
Route::prefix('{locale}')
    ->where(['locale' => '[A-Za-z]{2,3}([_-][A-Za-z]{2,4})?'])
    ->middleware(SetLocale::class)
    ->name('default.locale.')
    ->group($frontendRoutes);

Route::middleware(SetLocale::class)
    ->name('default.')
    ->group($frontendRoutes);
