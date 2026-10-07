<?php

namespace Modules\Blog\Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Auth\Models\User;
use Modules\Blog\Enums\PostStatus;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\Post;
use Modules\Blog\Models\PostTranslation;
use Modules\Blog\Tests\TestCase;

class PostsPageTest extends TestCase
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
        return '/admin/blog/posts';
    }

    protected function makePost(): Post
    {
        $post = Post::factory()->create();

        $post->translations()->updateOrCreate(
            ['locale' => 'en'],
            ['locale' => 'en', 'title' => 'Default title', 'slug' => 'default-'.uniqid()]
        );

        return $post;
    }

    public function test_super_admin_can_view_posts(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->get($this->base())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Blog::posts/Index', false)
                ->has('posts.data')
                ->has('abilities')
            );
    }

    public function test_super_admin_can_view_create_form(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->get($this->base().'/create')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Blog::posts/Form', false)
                ->where('post', null)
                ->has('categories')
            );
    }

    public function test_super_admin_can_view_edit_form(): void
    {
        $post = $this->makePost();

        $this->actingAs($this->admin(), 'web')
            ->get($this->base().'/'.$post->id.'/edit')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Blog::posts/Form', false)
                ->where('post.id', $post->id)
                ->has('categories')
            );
    }

    public function test_super_admin_can_create_post(): void
    {
        $category = Category::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), [
                'status' => PostStatus::Published->value,
                'categories' => [$category->id],
                'translations' => [
                    ['locale' => 'en', 'title' => 'Hello world', 'slug' => 'hello-world'],
                ],
            ])
            ->assertRedirect(route('admin.blog.posts.index'));

        $this->assertDatabaseHas('post_translations', ['slug' => 'hello-world', 'title' => 'Hello world']);
    }

    public function test_post_content_is_sanitized_on_store(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), [
                'status' => PostStatus::Published->value,
                'translations' => [
                    [
                        'locale' => 'en',
                        'title' => 'XSS attempt',
                        'slug' => 'xss-attempt',
                        'content' => '<p onclick="evil()">Hi</p><script>alert(1)</script>',
                    ],
                ],
            ])
            ->assertRedirect(route('admin.blog.posts.index'));

        $content = PostTranslation::query()->where('slug', 'xss-attempt')->value('content');

        $this->assertStringNotContainsString('<script', $content);
        $this->assertStringNotContainsString('onclick', $content);
        $this->assertStringContainsString('Hi', $content);
    }

    public function test_store_validates_translations(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), ['status' => 'invalid', 'translations' => []])
            ->assertSessionHasErrors(['status', 'translations']);
    }

    public function test_super_admin_can_update_post(): void
    {
        $post = $this->makePost();

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/'.$post->id, [
                'status' => PostStatus::Draft->value,
                'translations' => [
                    ['locale' => 'en', 'title' => 'Updated title', 'slug' => 'updated-title'],
                ],
            ])
            ->assertRedirect();

        $this->assertSame('Updated title', $post->fresh()->translate('en')->title);
        $this->assertSame(PostStatus::Draft, $post->fresh()->status);
    }

    public function test_super_admin_can_delete_post(): void
    {
        $post = $this->makePost();

        $this->actingAs($this->admin(), 'web')
            ->delete($this->base().'/'.$post->id)
            ->assertRedirect();

        $this->assertDatabaseMissing('posts', ['id' => $post->id]);
    }

    public function test_index_filters_posts_by_status(): void
    {
        $this->makePost();
        Post::factory()->draft()->create();

        $this->actingAs($this->admin(), 'web')
            ->get($this->base().'?status=published')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('posts.data', 1));
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get($this->base())
            ->assertForbidden();
    }
}
