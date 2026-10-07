<?php

namespace Modules\Auth\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Auth\Models\User;

class EmailVerificationController extends Controller
{
    /**
     * Show the verification notice for the authenticated user.
     */
    public function notice(Request $request): Response|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(admin_url());
        }

        return Inertia::render('Auth::auth/VerifyEmail', [
            'title' => __('admin_auth.verifyEmail.title'),
            'email' => $request->user()->email,
        ]);
    }

    /**
     * Resend the verification link.
     */
    public function resend(Request $request): RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended(admin_url());
        }

        $request->user()->sendEmailVerificationNotification();

        return back()->with('success', __('admin_auth.verifyEmail.resentSuccess'));
    }

    /**
     * Verify the user's email from a signed link.
     */
    public function verify(Request $request, string $id, string $hash): RedirectResponse
    {
        $user = User::query()->findOrFail($id);

        abort_unless(hash_equals(sha1($user->getEmailForVerification()), $hash), 403);

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        if ($request->user()?->is($user)) {
            return redirect()->intended(admin_url())->with('success', 'Your email has been verified.');
        }

        return redirect()->route('login')->with('success', 'Your email has been verified.');
    }
}
