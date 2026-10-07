<?php

namespace Modules\Auth\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Contracts\User as SocialUser;
use Laravel\Socialite\Facades\Socialite;
use Modules\Auth\Enums\SocialProvider;
use Modules\Auth\Models\User;
use Modules\Auth\Models\UserSocialConnection;
use Modules\Auth\Traits\HasSafeRedirect;

class SocialLoginController extends Controller
{
    use HasSafeRedirect;

    public function redirect(Request $request, string $driver): RedirectResponse
    {
        $provider = $this->resolveProvider($driver);

        $redirect = $this->safeRedirect($request->query('redirect'));

        if ($redirect !== null) {
            $request->session()->put('url.intended', $redirect);
        }

        $provider->configure();

        return Socialite::driver($provider->value)->redirect();
    }

    public function callback(Request $request, string $driver): RedirectResponse
    {
        $provider = $this->resolveProvider($driver);
        $provider->configure();

        try {
            $socialUser = Socialite::driver($provider->value)->user();
        } catch (Exception $e) {
            throw ValidationException::withMessages([
                'driver' => ['Social authentication failed.'],
            ]);
        }

        $user = $this->findOrCreateUser($provider, $socialUser);

        Auth::guard('web')->login($user, true);
        $request->session()->regenerate();

        return redirect()->intended(admin_url());
    }

    /**
     * Resolve and validate a supported, configured social provider.
     */
    private function resolveProvider(string $driver): SocialProvider
    {
        $provider = SocialProvider::tryFrom($driver);

        if ($provider === null || ! $provider->isConfigured()) {
            throw ValidationException::withMessages([
                'driver' => ['Unsupported social provider.'],
            ]);
        }

        return $provider;
    }

    /**
     * Find or create the user behind a social identity and link the connection.
     */
    private function findOrCreateUser(SocialProvider $provider, SocialUser $socialUser): User
    {
        $connection = UserSocialConnection::findByProvider($provider->value, $socialUser->getId());

        if ($connection !== null) {
            return $connection->user;
        }

        return DB::transaction(function () use ($provider, $socialUser): User {
            $email = $socialUser->getEmail();

            /** @var User|null $user */
            $user = $email !== null
                ? User::query()->where('email', $email)->first()
                : null;

            if ($user === null) {
                $user = new User;
                $user->fill([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'email' => $email ?? $this->syntheticEmail($provider, $socialUser->getId()),
                    'password' => Str::random(32),
                ]);
                $user->save();

                event(new Registered($user));
            }

            if (! $user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $user->socialConnections()->firstOrCreate(
                [
                    'provider' => $provider->value,
                    'provider_id' => $socialUser->getId(),
                ],
                [
                    'provider_data' => [
                        'name' => $socialUser->getName(),
                        'email' => $email,
                        'avatar' => $socialUser->getAvatar(),
                        'nickname' => $socialUser->getNickname(),
                    ],
                ],
            );

            return $user;
        });
    }

    /**
     * Fallback email for providers that do not expose a verified address.
     */
    private function syntheticEmail(SocialProvider $provider, string $providerId): string
    {
        return sprintf('%s_%s@social.local', $provider->value, $providerId);
    }
}
