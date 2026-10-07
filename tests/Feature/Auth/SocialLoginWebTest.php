<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Modules\Auth\Enums\SocialProvider;
use Modules\Auth\Models\User;
use Modules\Auth\Models\UserSocialConnection;
use Tests\TestCase;

class SocialLoginWebTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('passport:keys');

        config([
            'services.google.client_id' => 'fake-google-id',
            'services.google.client_secret' => 'fake-google-secret',
            'services.facebook.client_id' => 'fake-facebook-id',
            'services.facebook.client_secret' => 'fake-facebook-secret',
            'services.github.client_id' => 'fake-github-id',
            'services.github.client_secret' => 'fake-github-secret',
        ]);
    }

    public function test_social_redirect_sends_user_to_provider(): void
    {
        Socialite::fake('google', SocialiteUser::fake());

        $response = $this->get('/auth/social/google/redirect');

        $response->assertRedirect('https://socialite.fake/google/authorize');
    }

    public function test_social_callback_creates_new_user_and_connection(): void
    {
        Socialite::fake('google', SocialiteUser::fake([
            'id' => 'google-123',
            'email' => 'new-social@example.com',
            'name' => 'New Social User',
        ]));

        $response = $this->get('/auth/social/google/callback');

        $response->assertRedirect();
        $this->assertAuthenticated('web');
        $this->assertDatabaseHas('users', ['email' => 'new-social@example.com']);
        $this->assertDatabaseHas('user_social_connections', [
            'provider' => 'google',
            'provider_id' => 'google-123',
        ]);

        $user = User::query()->where('email', 'new-social@example.com')->firstOrFail();
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_social_callback_logs_in_user_with_existing_connection(): void
    {
        $user = User::factory()->create(['email' => 'existing@example.com']);
        UserSocialConnection::query()->create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => 'google-existing',
        ]);

        Socialite::fake('google', SocialiteUser::fake([
            'id' => 'google-existing',
            'email' => 'existing@example.com',
        ]));

        $this->get('/auth/social/google/callback')->assertRedirect();

        $this->assertAuthenticatedAs($user, 'web');
        $this->assertSame(1, User::query()->count());
    }

    public function test_social_callback_links_existing_user_by_verified_email(): void
    {
        $user = User::factory()->create(['email' => 'link-me@example.com']);

        Socialite::fake('github', SocialiteUser::fake([
            'id' => 'github-999',
            'email' => 'link-me@example.com',
            'name' => 'Link Me',
        ]));

        $this->get('/auth/social/github/callback')->assertRedirect();

        $this->assertAuthenticatedAs($user, 'web');
        $this->assertSame(1, User::query()->count());
        $this->assertDatabaseHas('user_social_connections', [
            'user_id' => $user->id,
            'provider' => 'github',
            'provider_id' => 'github-999',
        ]);
    }

    public function test_unsupported_driver_is_rejected(): void
    {
        $this->getJson('/auth/social/twitter/callback')->assertStatus(422);
    }

    public function test_social_redirect_supports_every_configured_driver(): void
    {
        $drivers = array_map(
            static fn ($provider) => $provider->value,
            SocialProvider::cases()
        );

        foreach ($drivers as $driver) {
            config([
                "services.{$driver}.client_id" => "fake-{$driver}-id",
                "services.{$driver}.client_secret" => "fake-{$driver}-secret",
            ]);

            Socialite::fake($driver, SocialiteUser::fake());

            $this->get("/auth/social/{$driver}/redirect")
                ->assertRedirect("https://socialite.fake/{$driver}/authorize");
        }
    }
}
