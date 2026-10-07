<?php

namespace Modules\Blog\Tests\Feature\Admin;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Auth\Models\User;
use Modules\Blog\Enums\CommentStatus;
use Modules\Blog\Models\Comment;
use Modules\Blog\Tests\TestCase;

class CommentsPageTest extends TestCase
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
        return '/admin/blog/comments';
    }

    public function test_super_admin_can_view_comments(): void
    {
        Comment::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->get($this->base())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Blog::comments/Index', false)
                ->has('comments.data')
                ->has('abilities')
            );
    }

    public function test_super_admin_can_update_comment_status(): void
    {
        $comment = Comment::factory()->pending()->create();

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/'.$comment->id, ['status' => CommentStatus::Approved->value])
            ->assertRedirect();

        $this->assertSame(CommentStatus::Approved, $comment->fresh()->status);
    }

    public function test_update_validates_status(): void
    {
        $comment = Comment::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/'.$comment->id, ['status' => 'invalid'])
            ->assertSessionHasErrors('status');
    }

    public function test_super_admin_can_delete_comment(): void
    {
        $comment = Comment::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->delete($this->base().'/'.$comment->id)
            ->assertRedirect();

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get($this->base())
            ->assertForbidden();
    }
}
