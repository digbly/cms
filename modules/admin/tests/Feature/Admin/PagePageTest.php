<?php

namespace Modules\Admin\Tests\Feature\Admin;

use App\Enums\PageStatus;
use App\Models\Pages\Page;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Models\User;

class PagePageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->artisan('permission:generate');
    }

    protected function admin(): User
    {
        return User::factory()->create(['is_super_admin' => true]);
    }

    protected function base(): string
    {
        return '/admin/pages';
    }

    public function test_super_admin_can_view_pages(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->get($this->base())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::pages/Index', false)
                ->has('pages.data')
                ->has('abilities')
            );
    }

    public function test_super_admin_can_create_page(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), [
                'title' => 'About us',
                'slug' => 'about-us',
                'content' => '<p>Hello</p>',
                'status' => PageStatus::Published->value,
                'locale' => 'en',
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('pages', 1);
        $this->assertDatabaseHas('page_translations', ['slug' => 'about-us', 'title' => 'About us']);
    }

    public function test_store_validates_required_title(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), ['slug' => 'no-title'])
            ->assertSessionHasErrors('title');
    }

    public function test_super_admin_can_update_page(): void
    {
        $page = Page::create(['status' => PageStatus::Draft->value]);
        $page->fillTranslation('en', ['title' => 'Old', 'slug' => 'old', 'content' => null, 'description' => null]);

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/'.$page->id, [
                'title' => 'New Title',
                'slug' => 'new-title',
                'status' => PageStatus::Published->value,
                'locale' => 'en',
            ])
            ->assertRedirect();

        $this->assertSame('New Title', $page->fresh()->translate('en')->title);
        $this->assertSame(PageStatus::Published, $page->fresh()->status);
    }

    public function test_super_admin_can_delete_page(): void
    {
        $page = Page::create(['status' => PageStatus::Draft->value]);
        $page->fillTranslation('en', ['title' => 'Temp', 'slug' => 'temp', 'content' => null, 'description' => null]);

        $this->actingAs($this->admin(), 'web')
            ->delete($this->base().'/'.$page->id)
            ->assertRedirect();

        $this->assertDatabaseMissing('pages', ['id' => $page->id]);
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get($this->base())
            ->assertForbidden();
    }

    public function test_index_filters_pages_by_search_and_status(): void
    {
        $published = Page::create(['status' => PageStatus::Published->value]);
        $published->fillTranslation('en', ['title' => 'About us', 'slug' => 'about', 'content' => null, 'description' => null]);

        $draft = Page::create(['status' => PageStatus::Draft->value]);
        $draft->fillTranslation('en', ['title' => 'Contact', 'slug' => 'contact', 'content' => null, 'description' => null]);

        $admin = $this->admin();

        $this->actingAs($admin, 'web')
            ->get($this->base().'?search=about')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('pages.data', 1));

        $this->actingAs($admin, 'web')
            ->get($this->base().'?status=draft')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('pages.data', 1)
                ->where('pages.data.0.slug', 'contact')
            );
    }
}
