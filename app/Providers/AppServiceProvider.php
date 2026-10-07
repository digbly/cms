<?php

namespace App\Providers;

use App\Contracts\AdminTranslation as AdminTranslationContract;
use App\Contracts\Menu as MenuContract;
use App\Contracts\MenuBox as MenuBoxContract;
use App\Contracts\NavMenu as NavMenuContract;
use App\Contracts\PageBlock as PageBlockContract;
use App\Contracts\PageTemplate as PageTemplateContract;
use App\Contracts\Setting as SettingContract;
use App\Contracts\Sidebar as SidebarContract;
use App\Contracts\ThemeSetting as ThemeSettingContract;
use App\Contracts\Widget as WidgetContract;
use App\Facades\AdminTranslation;
use App\Support\AdminTranslationRepository;
use App\Support\Customizes\CustomizeRegistry;
use App\Support\MenuBoxRepository;
use App\Support\MenuRepository;
use App\Support\NavMenuRepository;
use App\Support\PageBlockRepository;
use App\Support\PageTemplateRepository;
use App\Support\SettingRepository;
use App\Support\SidebarRepository;
use App\Support\ThemeSettingRepository;
use App\Support\WidgetRepository;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Passport\Passport;
use Modules\Auth\Models\OAuthClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AdminTranslationContract::class, AdminTranslationRepository::class);
        $this->app->singleton(SettingContract::class, SettingRepository::class);
        $this->app->singleton(ThemeSettingContract::class, ThemeSettingRepository::class);
        $this->app->singleton(MenuContract::class, MenuRepository::class);
        $this->app->singleton(MenuBoxContract::class, MenuBoxRepository::class);
        $this->app->singleton(NavMenuContract::class, NavMenuRepository::class);
        $this->app->singleton(WidgetContract::class, WidgetRepository::class);
        $this->app->singleton(SidebarContract::class, SidebarRepository::class);
        $this->app->singleton(PageBlockContract::class, PageBlockRepository::class);
        $this->app->singleton(PageTemplateContract::class, PageTemplateRepository::class);
        $this->app->singleton(CustomizeRegistry::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // The shared admin shell strings live in the application resources/lang.
        AdminTranslation::make('common', fn (): array => ['group' => 'common']);

        // Authenticated users who hit a guest-only route (e.g. /login) are
        // sent to the admin dashboard instead of the site root.
        RedirectIfAuthenticated::redirectUsing(fn (): string => admin_url());

        Passport::tokensCan([
            'profile' => 'Read the authenticated user profile',
        ]);
        Passport::useClientModel(OAuthClient::class);
        Passport::authorizationView('auth.authorize');
        Passport::tokensExpireIn(now()->addDays(2));
        Passport::refreshTokensExpireIn(now()->addDays(30));
        Passport::personalAccessTokensExpireIn(now()->addMonths(6));
        // Passport::enablePasswordGrant();

        // Point the email verification link at the Inertia web route.
        VerifyEmail::createUrlUsing(static function (object $notifiable): string {
            return URL::temporarySignedRoute(
                'verification.verify.web',
                now()->addMinutes(60),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );
        });

        VerifyEmail::toMailUsing(static fn (object $notifiable, string $url): MailMessage => (new MailMessage)
            ->subject('Verify your email address')
            ->line('Please click the button below to verify your email address.')
            ->action('Verify email address', $url)
            ->line('If you did not create an account, no further action is required.'));

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        // Key login attempts by email + IP so one attacker cannot lock out an
        // account for everyone, while still slowing credential stuffing.
        RateLimiter::for('login', function (Request $request) {
            $email = $request->input('email');
            $email = is_string($email) ? Str::transliterate(Str::lower($email)) : '';

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });
    }
}
