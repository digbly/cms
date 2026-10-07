<?php

namespace Modules\Admin\Tests\Feature\Admin;

use App\Facades\Setting;
use App\Models\Menus\Menu;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Models\User;

class MenuPageTest extends TestCase
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
        return '/admin/menus';
    }

    public function test_super_admin_can_view_menus(): void
    {
        Menu::create(['name' => 'Main Menu']);

        $this->actingAs($this->admin(), 'web')
            ->get($this->base())
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::menus/Index', false)
                ->has('menus', 1)
                ->has('boxes')
                ->has('locations.data')
                ->has('abilities')
            );
    }

    public function test_super_admin_can_create_menu(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), ['name' => 'Main Menu'])
            ->assertRedirect();

        $this->assertDatabaseHas('menus', ['name' => 'Main Menu']);
    }

    public function test_store_validates_required_name(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->post($this->base(), ['name' => ''])
            ->assertSessionHasErrors('name');
    }

    public function test_super_admin_can_update_menu_tree(): void
    {
        $menu = Menu::create(['name' => 'Main']);
        $menu->items()->create(['box_key' => 'custom', 'link' => '/stale', 'display_order' => 0]);

        $content = json_encode([
            ['label' => 'Home', 'link' => '/', 'is_home' => 1],
            [
                'label' => 'About',
                'link' => '/about',
                'children' => [
                    ['label' => 'Team', 'link' => '/about/team'],
                ],
            ],
        ]);

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/'.$menu->id, [
                'name' => 'Main Updated',
                'content' => $content,
                'locale' => 'en',
            ])
            ->assertRedirect();

        $menu->refresh();

        $this->assertSame('Main Updated', $menu->name);
        $this->assertSame(3, $menu->items()->count());
        $this->assertDatabaseMissing('menu_items', ['link' => '/stale']);

        $about = $menu->items()->where('link', '/about')->firstOrFail();

        $this->assertSame(1, $about->children()->count());
        $this->assertSame('Team', $about->children()->first()->label);
        $this->assertDatabaseHas('menu_item_translations', [
            'menu_item_id' => $about->id,
            'locale' => 'en',
            'label' => 'About',
        ]);
    }

    public function test_update_assigns_menu_to_locations(): void
    {
        $menu = Menu::create(['name' => 'Main']);

        $this->actingAs($this->admin(), 'web')
            ->put($this->base().'/'.$menu->id, [
                'name' => 'Main',
                'content' => json_encode([]),
                'locale' => 'en',
                'location' => ['primary'],
            ])
            ->assertRedirect();

        $this->assertSame($menu->id, Setting::get('nav_location')['primary']);
    }

    public function test_super_admin_can_delete_menu(): void
    {
        $menu = Menu::create(['name' => 'Main']);

        $this->actingAs($this->admin(), 'web')
            ->delete($this->base().'/'.$menu->id)
            ->assertRedirect();

        $this->assertDatabaseMissing('menus', ['id' => $menu->id]);
    }

    public function test_box_items_endpoint_returns_results(): void
    {
        $this->actingAs($this->admin(), 'web')
            ->get($this->base().'/boxes/posts/items')
            ->assertOk()
            ->assertJsonStructure(['results']);
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get($this->base())
            ->assertForbidden();
    }
}
