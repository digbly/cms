<?php

namespace Modules\Auth\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Auth\Http\Requests\RegisterRequest;
use Modules\Auth\Models\User;

class RegisterController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Auth::auth/Register', [
            'title' => __('admin_auth.register.title'),
        ]);
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = DB::transaction(function () use ($request): User {
            $user = new User;
            $user->fill($request->safe()->all());
            $user->save();

            return $user;
        });

        event(new Registered($user));

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return redirect()->route('verification.notice');
    }
}
