<?php

use Illuminate\Support\Facades\Route;
use Themes\Default\Http\Controllers\CategoryController;
use Themes\Default\Http\Controllers\CommentController;
use Themes\Default\Http\Controllers\HomeController;
use Themes\Default\Http\Controllers\PostController;

Route::get('/', [HomeController::class, 'index'])->name('default.home');
Route::get('/search', [HomeController::class, 'search'])->name('default.search');

Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('default.categories.show');
Route::get('/posts/{slug}', [PostController::class, 'show'])->name('default.posts.show');

Route::post('/posts/{post}/comments', [CommentController::class, 'store'])
    ->name('default.comments.store')
    ->middleware('throttle:20,1');
