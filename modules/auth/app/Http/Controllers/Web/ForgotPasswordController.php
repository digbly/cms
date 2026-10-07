<?php

namespace Modules\Auth\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Auth\Http\Requests\ForgotPasswordRequest;

class ForgotPasswordController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Auth::auth/ForgotPassword', [
            'title' => __('admin_auth.forgotPassword.title'),
        ]);
    }

    public function store(ForgotPasswordRequest $request): RedirectResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return back()->withInput()->withErrors(['email' => __($status)]);
        }

        return back()->with('success', __($status));
    }
}
