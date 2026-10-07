<?php

namespace Modules\Admin\Tests\Feature\Admin;

use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Enums\DashboardPermission;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Models\User;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->artisan('permission:generate');
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/admin')->assertRedirect('/login');
    }

    public function test_super_admin_can_view_dashboard(): void
    {
        $user = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($user, 'web')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::dashboard/Index', false)
                ->has('stats', 3)
                ->has('admin_menu')
            );
    }

    public function test_user_with_dashboard_permission_can_view_dashboard(): void
    {
        $role = Role::findOrCreate('dashboard-viewer', 'api');
        $role->syncPermissions([DashboardPermission::View->value]);

        $user = User::factory()->create();
        $user->assignRole($role);

        $this->actingAs($user, 'web')
            ->get('/admin')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::dashboard/Index', false)
            );
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/admin')
            ->assertForbidden();
    }
}
