<?php

namespace Modules\Auth\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Auth\Http\Requests\ChangePasswordRequest;
use Modules\Auth\Http\Requests\UpdateProfileRequest;
use Modules\Auth\Models\User;

class ProfileController extends Controller
{
    public function show(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        return Inertia::render('Auth::profile/Index', [
            'title' => __('admin_auth.profile.title'),
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatarUrl(),
                'email_verified' => $user->hasVerifiedEmail(),
            ],
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->fill($request->safe()->only('name'));
        $user->save();

        if ($request->hasFile('avatar')) {
            $user->addMediaFromRequest('avatar')->toMediaCollection('avatar');
        }

        return back()->with('success', __('admin_auth.profile.notices.profileUpdated'));
    }

    public function updatePassword(ChangePasswordRequest $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->post('current_password'), $user->password)) {
            return back()->withErrors(['current_password' => __('admin_auth.profile.errors.currentRequired')]);
        }

        $user->forceFill(['password' => $request->post('password')]);
        $user->save();

        // Invalidate sessions on other devices while keeping this one signed in.
        Auth::guard('web')->logoutOtherDevices($request->post('password'));

        return back()->with('success', __('admin_auth.profile.notices.passwordUpdated'));
    }
}
