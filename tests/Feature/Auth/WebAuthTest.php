<?php

namespace Tests\Feature\Auth;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Auth\Models\User;
use Tests\TestCase;

class WebAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_register_page_renders(): void
    {
        $this->get('/register')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Auth::auth/Register', false));
    }

    public function test_user_can_register_and_is_logged_in(): void
    {
        $response = $this->post('/register', [
            'name' => 'New User',
            'email' => 'new-user@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect(route('verification.notice'));
        $this->assertAuthenticated('web');
        $this->assertDatabaseHas('users', ['email' => 'new-user@example.com']);
    }

    public function test_registration_sends_the_verification_email(): void
    {
        Notification::fake();

        $this->post('/register', [
            'name' => 'New User',
            'email' => 'verify-me@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $user = User::query()->where('email', 'verify-me@example.com')->firstOrFail();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_login_page_redirects_authenticated_user_to_admin(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/login')
            ->assertRedirect(admin_url());
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        User::factory()->create(['email' => 'limited@example.com']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post('/login', [
                'email' => 'limited@example.com',
                'password' => 'wrong-password',
            ])->assertRedirect();
        }

        $this->post('/login', [
            'email' => 'limited@example.com',
            'password' => 'wrong-password',
        ])->assertTooManyRequests();
    }

    public function test_login_with_non_scalar_email_is_rejected_not_crashed(): void
    {
        $this->post('/login', ['email' => ['x'], 'password' => 'secret'])
            ->assertSessionHasErrors('email');
    }

    public function test_login_rejects_backslash_open_redirect_target(): void
    {
        User::factory()->create(['email' => 'redirect@example.com']);

        $this->post('/login', [
            'email' => 'redirect@example.com',
            'password' => 'password',
            'redirect' => '/\\evil.example.com',
        ])->assertRedirect(admin_url());
    }

    public function test_register_validation_fails_for_duplicate_email(): void
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->post('/register', [
            'name' => 'New User',
            'email' => 'taken@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertSessionHasErrors('email');

        $this->assertGuest('web');
    }

    public function test_forgot_password_sends_reset_link(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email])->assertRedirect();

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_reset_password_updates_password(): void
    {
        $user = User::factory()->create(['password' => 'OldPassword123!']);
        $token = Password::createToken($user);

        $this->post('/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertRedirect('/login');

        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
    }

    public function test_verification_notice_requires_authentication(): void
    {
        $this->get('/email/verify')->assertRedirect('/login');
    }

    public function test_unverified_user_can_resend_verification_email(): void
    {
        Notification::fake();
        $user = User::factory()->unverified()->create();

        $this->actingAs($user, 'web')
            ->post('/email/verification-notification')
            ->assertRedirect();

        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_user_can_verify_email_from_signed_link(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify.web', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->get($url)->assertRedirect('/login');

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_verify_link_with_invalid_hash_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify.web', now()->addMinutes(60), [
            'id' => $user->id,
            'hash' => 'invalid-hash',
        ]);

        $this->get($url)->assertForbidden();

        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_profile_page_renders_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth::profile/Index', false)
                ->where('profile.email', $user->email)
            );
    }

    public function test_user_can_update_profile_name(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $this->actingAs($user, 'web')
            ->post('/profile', ['name' => 'New Name'])
            ->assertRedirect();

        $this->assertSame('New Name', $user->fresh()->name);
    }

    public function test_user_can_change_password(): void
    {
        $user = User::factory()->create(['password' => 'OldPassword123!']);

        $this->actingAs($user, 'web')
            ->put('/profile/password', [
                'current_password' => 'OldPassword123!',
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertRedirect();

        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));
    }

    public function test_change_password_rejects_wrong_current_password(): void
    {
        $user = User::factory()->create(['password' => 'OldPassword123!']);

        $this->actingAs($user, 'web')
            ->put('/profile/password', [
                'current_password' => 'WrongPassword!',
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertSessionHasErrors('current_password');

        $this->assertTrue(Hash::check('OldPassword123!', $user->fresh()->password));
    }

    public function test_changing_password_keeps_the_current_session_authenticated(): void
    {
        $user = User::factory()->create(['password' => 'OldPassword123!']);

        $this->actingAs($user, 'web')
            ->put('/profile/password', [
                'current_password' => 'OldPassword123!',
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertRedirect();

        $this->get('/profile')->assertOk();
    }

    public function test_changing_password_invalidates_other_device_sessions(): void
    {
        $user = User::factory()->create(['password' => 'OldPassword123!']);
        $oldHash = $user->password;

        $this->actingAs($user, 'web')
            ->put('/profile/password', [
                'current_password' => 'OldPassword123!',
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertRedirect();

        $this->flushSession();

        $this->withSession(['password_hash_web' => $oldHash])
            ->actingAs($user->fresh(), 'web')
            ->get('/profile')
            ->assertRedirect('/login');
    }

    public function test_social_routes_redirect_authenticated_users(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/auth/social/google/redirect')
            ->assertRedirect(admin_url());
    }
}
