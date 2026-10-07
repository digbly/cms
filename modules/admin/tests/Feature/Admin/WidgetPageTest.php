<?php

namespace Modules\Admin\Tests\Feature\Admin;

use App\Models\ThemeSidebar;
use App\Themes\FileRepository;
use App\Themes\ThemeManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Models\User;
use Themes\Default\Providers\ThemeServiceProvider;

class WidgetPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->artisan('permission:generate');

        $this->app->register(ThemeServiceProvider::class);
        $this->app->make(ThemeManager::class)->activate(
            $this->app->make(FileRepository::class)->findOrFail('Default')
        );
    }

    protected function admin(): User
    {
        return User::factory()->create(['is_super_admin' => true]);
    }

    protected function base(): string
    {
        return '/admin/widgets';
    }

    public function test_super_admin_can_view_widgets(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->get($this->base())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::widgets/Index', false)
                ->has('widgets')
                ->has('sidebars')
                ->has('sidebar_widgets')
                ->where('theme', 'default')
                ->has('abilities')
            );
    }

    public function test_super_admin_can_update_sidebar(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/sidebar', [
                'locale' => 'en',
                'content' => [
                    ['widget' => 'recent-posts', 'label' => 'Fresh', 'data' => ['limit' => 3]],
                    ['widget' => 'categories', 'label' => 'Topics'],
                ],
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('theme_sidebars', [
            'sidebar' => 'sidebar',
            'widget' => 'recent-posts',
            'display_order' => 1,
        ]);

        $recent = ThemeSidebar::query()->where('widget', 'recent-posts')->firstOrFail();

        $this->assertSame(3, $recent->data['limit']);
        $this->assertDatabaseHas('theme_sidebar_translations', [
            'theme_sidebar_id' => $recent->id,
            'locale' => 'en',
            'label' => 'Fresh',
        ]);

        // Re-save keeping only recent-posts: categories must be removed.
        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/sidebar', [
                'locale' => 'en',
                'content' => [
                    ['id' => $recent->id, 'widget' => 'recent-posts', 'label' => 'Fresh', 'data' => ['limit' => 5]],
                ],
            ])
            ->assertRedirect();

        $this->assertSame(1, ThemeSidebar::query()->where('sidebar', 'sidebar')->count());
        $this->assertDatabaseMissing('theme_sidebars', ['widget' => 'categories']);
        $this->assertSame(5, $recent->fresh()->data['limit']);
    }

    public function test_update_does_not_hijack_widgets_from_another_theme(): void
    {
        $foreign = ThemeSidebar::create([
            'sidebar' => 'sidebar',
            'widget' => 'recent-posts',
            'data' => ['limit' => 1],
            'theme' => 'other',
            'display_order' => 1,
        ]);

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/sidebar', [
                'locale' => 'en',
                'content' => [
                    ['id' => $foreign->id, 'widget' => 'recent-posts', 'label' => 'Hijack', 'data' => ['limit' => 9]],
                ],
            ])
            ->assertRedirect();

        $this->assertSame('other', $foreign->fresh()->theme);
        $this->assertSame(1, $foreign->fresh()->data['limit']);
        $this->assertSame(2, ThemeSidebar::query()->where('widget', 'recent-posts')->count());
    }

    public function test_update_claims_legacy_null_theme_widgets_instead_of_duplicating(): void
    {
        $legacy = ThemeSidebar::create([
            'sidebar' => 'sidebar',
            'widget' => 'recent-posts',
            'data' => ['limit' => 1],
            'theme' => null,
            'display_order' => 1,
        ]);

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/sidebar', [
                'locale' => 'en',
                'content' => [
                    ['id' => $legacy->id, 'widget' => 'recent-posts', 'label' => 'Legacy', 'data' => ['limit' => 7]],
                ],
            ])
            ->assertRedirect();

        $this->assertSame(1, ThemeSidebar::query()->where('widget', 'recent-posts')->count());
        $this->assertSame(7, $legacy->fresh()->data['limit']);
    }

    public function test_update_rejects_unknown_sidebar(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/unknown', ['content' => []])
            ->assertNotFound();
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get($this->base())
            ->assertForbidden();
    }
}
