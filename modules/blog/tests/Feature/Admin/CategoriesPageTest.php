<?php

namespace Modules\Blog\Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Auth\Models\User;
use Modules\Blog\Models\Category;
use Modules\Blog\Tests\TestCase;

class CategoriesPageTest extends TestCase
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
        return '/admin/blog/categories';
    }

    public function test_super_admin_can_view_categories(): void
    {
        Category::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->get($this->base())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Blog::categories/Index', false)
                ->has('categories.data')
                ->has('abilities')
            );
    }

    public function test_super_admin_can_create_category(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), [
                'is_home' => true,
                'translations' => [
                    ['locale' => 'en', 'name' => 'News', 'slug' => 'news'],
                ],
            ])
            ->assertRedirect(route('admin.blog.categories.index'));

        $this->assertDatabaseHas('post_category_translations', ['slug' => 'news', 'name' => 'News']);
        $this->assertDatabaseHas('post_categories', ['is_home' => true]);
    }

    public function test_store_validates_translations(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), ['translations' => []])
            ->assertSessionHasErrors('translations');
    }

    public function test_super_admin_can_update_category(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/'.$category->id, [
                'translations' => [
                    ['locale' => 'en', 'name' => 'Updated', 'slug' => 'updated'],
                ],
            ])
            ->assertRedirect();

        $this->assertSame('Updated', $category->fresh()->translate('en')->name);
    }

    public function test_super_admin_can_delete_category(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->delete($this->base().'/'.$category->id)
            ->assertRedirect();

        $this->assertDatabaseMissing('post_categories', ['id' => $category->id]);
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get($this->base())
            ->assertForbidden();
    }
}
