<?php

namespace Modules\Admin\Tests\Feature\Admin;

use App\Contracts\Setting as SettingContract;
use App\Models\MediaItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Enums\SocialProvider;
use Modules\Auth\Models\User;

class SettingsPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->artisan('permission:generate');
    }

    public function test_super_admin_can_view_settings_page(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($admin, 'web')
            ->get('/admin/settings')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::settings/Index', false)
                ->has('settings')
                ->has('locales')
                ->has('socialProviders', count(SocialProvider::cases()))
            );
    }

    public function test_super_admin_can_update_settings(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($admin, 'web')
            ->put('/admin/settings', [
                'sitename' => 'My Site',
                'user_registration' => true,
            ])
            ->assertRedirect();

        $settings = app(SettingContract::class);
        $this->assertSame('My Site', $settings->get('sitename'));
        $this->assertTrue($settings->boolean('user_registration'));
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/admin/settings')
            ->assertForbidden();
    }

    public function test_settings_page_resolves_branding_media(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);

        $media = MediaItem::factory()->create();
        app(SettingContract::class)->set('logo', $media->id);

        $this->actingAs($admin, 'web')
            ->get('/admin/settings')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::settings/Index', false)
                ->where('media.logo.id', $media->id)
            );
    }

    public function test_super_admin_can_update_branding(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);
        $media = MediaItem::factory()->create();

        $this->actingAs($admin, 'web')
            ->put('/admin/settings', ['logo' => $media->id])
            ->assertRedirect();

        $this->assertSame($media->id, app(SettingContract::class)->get('logo'));
    }

    public function test_super_admin_can_update_social_login_settings(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($admin, 'web')
            ->put('/admin/settings', [
                'social_login_google_enabled' => true,
                'social_login_google_client_id' => 'google-client-id',
                'social_login_google_client_secret' => 'google-client-secret',
            ])
            ->assertRedirect();

        $settings = app(SettingContract::class);
        $this->assertTrue($settings->boolean('social_login_google_enabled'));
        $this->assertSame('google-client-id', $settings->get('social_login_google_client_id'));

        $provider = SocialProvider::Google;
        $provider->configure();

        $this->assertSame('google-client-id', config('services.google.client_id'));
        $this->assertSame('google-client-secret', config('services.google.client_secret'));
        $this->assertTrue($provider->isConfigured());
    }

    public function test_social_provider_is_not_configured_when_disabled(): void
    {
        app(SettingContract::class)->sets([
            'social_login_google_enabled' => false,
            'social_login_google_client_id' => 'google-client-id',
            'social_login_google_client_secret' => 'google-client-secret',
        ]);

        $this->assertFalse(SocialProvider::Google->isConfigured());
    }

    public function test_super_admin_can_update_hyphenated_social_provider(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($admin, 'web')
            ->put('/admin/settings', [
                'social_login_linkedin-openid_enabled' => true,
                'social_login_linkedin-openid_client_id' => 'linkedin-client-id',
                'social_login_linkedin-openid_client_secret' => 'linkedin-client-secret',
            ])
            ->assertRedirect();

        $settings = app(SettingContract::class);
        $this->assertSame('linkedin-client-id', $settings->get('social_login_linkedin-openid_client_id'));

        $provider = SocialProvider::LinkedInOpenId;
        $provider->configure();

        $this->assertSame('linkedin-client-id', config('services.linkedin-openid.client_id'));
        $this->assertTrue($provider->isConfigured());
    }
}
