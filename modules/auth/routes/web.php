<?php

use Illuminate\Support\Facades\Route;
use Modules\Auth\Http\Controllers\Web\EmailVerificationController;
use Modules\Auth\Http\Controllers\Web\ForgotPasswordController;
use Modules\Auth\Http\Controllers\Web\LoginController;
use Modules\Auth\Http\Controllers\Web\ProfileController;
use Modules\Auth\Http\Controllers\Web\RegisterController;
use Modules\Auth\Http\Controllers\Web\ResetPasswordController;
use Modules\Auth\Http\Controllers\Web\SocialLoginController;

Route::get('login', [LoginController::class, 'show'])
    ->middleware('guest:web')
    ->name('login');
Route::post('login', [LoginController::class, 'store'])
    ->middleware(['guest:web', 'throttle:login'])
    ->name('login.attempt');
Route::post('logout', [LoginController::class, 'logout'])->name('logout');

Route::get('auth/social/{driver}/redirect', [SocialLoginController::class, 'redirect'])
    ->middleware('guest:web')
    ->name('social.redirect');
Route::get('auth/social/{driver}/callback', [SocialLoginController::class, 'callback'])
    ->middleware('guest:web')
    ->name('social.callback');

Route::middleware('guest:web')->group(function () {
    Route::get('register', [RegisterController::class, 'show'])->name('register');
    Route::post('register', [RegisterController::class, 'store'])->middleware('throttle:auth');

    Route::get('forgot-password', [ForgotPasswordController::class, 'show'])->name('password.request');
    Route::post('forgot-password', [ForgotPasswordController::class, 'store'])
        ->middleware('throttle:auth')
        ->name('password.email');

    Route::get('reset-password/{token}', [ResetPasswordController::class, 'show'])->name('password.reset');
    Route::post('reset-password', [ResetPasswordController::class, 'store'])
        ->middleware('throttle:auth')
        ->name('password.update');
});

Route::middleware('auth:web')->group(function () {
    Route::get('email/verify', [EmailVerificationController::class, 'notice'])->name('verification.notice');
    Route::post('email/verification-notification', [EmailVerificationController::class, 'resend'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
});

Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify.web');
