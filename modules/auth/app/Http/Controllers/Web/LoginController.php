<?php

namespace Modules\Auth\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Auth\Enums\SocialProvider;
use Modules\Auth\Http\Requests\Web\LoginRequest;
use Modules\Auth\Traits\HasSafeRedirect;

class LoginController extends Controller
{
    use HasSafeRedirect;

    public function show(Request $request): Response
    {
        return Inertia::render('Auth::auth/Login', [
            'title' => 'Sign in',
            'providers' => collect(SocialProvider::configured())
                ->map(fn (SocialProvider $provider): array => [
                    'value' => $provider->value,
                    'label' => $provider->label(),
                ])
                ->values()
                ->all(),
            'redirect' => $this->safeRedirect($request->query('redirect')),
        ]);
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::guard('web')->attempt($credentials, $request->boolean('remember'))) {
            return back()
                ->withInput($request->only('email', 'redirect'))
                ->withErrors(['email' => 'These credentials do not match our records.']);
        }

        $request->session()->regenerate();

        return redirect()->intended($this->safeRedirect($request->input('redirect')) ?? admin_url());
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
