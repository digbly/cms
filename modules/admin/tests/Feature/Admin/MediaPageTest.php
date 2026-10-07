<?php

namespace Modules\Admin\Tests\Feature\Admin;

use App\Models\MediaItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Models\User;

class MediaPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        Storage::fake('public');
        $this->artisan('permission:generate');
    }

    protected function admin(): User
    {
        return User::factory()->create(['is_super_admin' => true]);
    }

    protected function base(): string
    {
        return '/admin/media';
    }

    public function test_super_admin_can_view_media_library(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->get($this->base())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::media/Index', false)
                ->has('items.data')
                ->has('abilities')
            );
    }

    public function test_super_admin_can_upload_media(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), [
                'files' => [UploadedFile::fake()->image('photo.jpg', 800, 600)],
                'alt' => 'A photo',
            ])
            ->assertRedirect();

        $this->assertDatabaseCount('media_items', 1);
        $this->assertDatabaseCount('media', 1);
        $this->assertSame('A photo', MediaItem::query()->firstOrFail()->alt);
    }

    public function test_super_admin_can_update_media_details(): void
    {
        $item = MediaItem::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/'.$item->id, ['title' => 'Renamed', 'alt' => 'Alt'])
            ->assertRedirect();

        $this->assertSame('Renamed', $item->fresh()->title);
    }

    public function test_super_admin_can_delete_media(): void
    {
        $item = MediaItem::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->delete($this->base().'/'.$item->id)
            ->assertRedirect();

        $this->assertDatabaseMissing('media_items', ['id' => $item->id]);
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get($this->base())
            ->assertForbidden();
    }

    public function test_media_list_endpoint_returns_json_for_picker(): void
    {
        MediaItem::factory()->create();

        $this->actingAs($this->admin(), 'web')
            ->getJson($this->base().'/list')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'url', 'thumb_url', 'is_image']], 'meta']);
    }
}
