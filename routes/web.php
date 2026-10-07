<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\Web\LoginController;
use Modules\Auth\Http\Controllers\Web\SocialLoginController;

Route::get('/login', [LoginController::class, 'show'])
    ->middleware('guest:web')
    ->name('login');
Route::post('/login', [LoginController::class, 'store'])
    ->middleware(['guest:web', 'throttle:login'])
    ->name('login.attempt');
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::get('/auth/social/{driver}/redirect', [SocialLoginController::class, 'redirect'])
    ->middleware('guest:web')
    ->name('social.redirect');
Route::get('/auth/social/{driver}/callback', [SocialLoginController::class, 'callback'])
    ->middleware('guest:web')
    ->name('social.callback');
