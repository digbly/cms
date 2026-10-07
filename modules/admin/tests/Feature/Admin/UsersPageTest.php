<?php

namespace Modules\Admin\Tests\Feature\Admin;

use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Enums\UserPermission;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Models\User;

class UsersPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->artisan('permission:generate');
    }

    public function test_super_admin_can_list_users(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($admin, 'web')
            ->get('/admin/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin::users/Index', false)
                ->has('users.data')
                ->has('roles')
            );
    }

    public function test_super_admin_can_create_user(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($admin, 'web')
            ->post('/admin/users', [
                'name' => 'Created User',
                'email' => 'created@example.com',
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
                'roles' => [],
                'is_super_admin' => false,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'created@example.com']);
    }

    public function test_store_validates_unique_email(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($admin, 'web')
            ->post('/admin/users', [
                'name' => 'Dup',
                'email' => $admin->email,
                'password' => 'Password123!',
                'password_confirmation' => 'Password123!',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_super_admin_can_update_user(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);
        $target = User::factory()->create(['name' => 'Old Name']);

        $this->actingAs($admin, 'web')
            ->put('/admin/users/'.$target->id, [
                'name' => 'New Name',
                'email' => $target->email,
            ])
            ->assertRedirect();

        $this->assertSame('New Name', $target->fresh()->name);
    }

    public function test_super_admin_can_reset_user_password(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);
        $target = User::factory()->create();

        $this->actingAs($admin, 'web')
            ->put('/admin/users/'.$target->id.'/password', [
                'password' => 'NewPassword123!',
                'password_confirmation' => 'NewPassword123!',
            ])
            ->assertRedirect();

        $this->assertTrue(Hash::check('NewPassword123!', $target->fresh()->password));
    }

    public function test_super_admin_can_delete_and_restore_user(): void
    {
        $admin = User::factory()->create(['is_super_admin' => true]);
        $target = User::factory()->create();

        $this->actingAs($admin, 'web')
            ->delete('/admin/users/'.$target->id)
            ->assertRedirect();

        $this->assertSoftDeleted('users', ['id' => $target->id]);

        $this->actingAs($admin, 'web')
            ->post('/admin/users/'.$target->id.'/restore')
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $target->id, 'deleted_at' => null]);
    }

    public function test_user_without_permission_is_forbidden(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->get('/admin/users')
            ->assertForbidden();
    }

    public function test_admin_with_permission_can_list_users(): void
    {
        $actor = $this->userWithPermission();

        $this->actingAs($actor, 'web')
            ->get('/admin/users')
            ->assertOk();
    }

    public function test_non_super_admin_cannot_update_a_super_admin(): void
    {
        $actor = $this->userWithPermission();

        $target = User::factory()->create(['is_super_admin' => true]);

        $this->actingAs($actor, 'web')
            ->put('/admin/users/'.$target->id, [
                'name' => 'Hacked',
                'email' => $target->email,
            ])
            ->assertSessionHasErrors('user');
    }

    public function test_non_super_admin_cannot_restore_a_super_admin(): void
    {
        $actor = $this->userWithPermission();

        $target = User::factory()->create(['is_super_admin' => true]);
        $target->delete();

        $this->actingAs($actor, 'web')
            ->post('/admin/users/'.$target->id.'/restore')
            ->assertSessionHasErrors('user');
    }

    public function test_user_cannot_delete_self(): void
    {
        $actor = $this->userWithPermission();

        $this->actingAs($actor, 'web')
            ->delete('/admin/users/'.$actor->id)
            ->assertSessionHasErrors('user');

        $this->assertNotSoftDeleted('users', ['id' => $actor->id]);
    }

    public function test_user_cannot_remove_own_management_permission(): void
    {
        $actor = $this->userWithPermission();

        $this->actingAs($actor, 'web')
            ->put('/admin/users/'.$actor->id, [
                'name' => $actor->name,
                'email' => $actor->email,
                'roles' => [],
            ])
            ->assertSessionHasErrors('roles');

        $this->assertTrue($actor->fresh()->hasRole('user-manager'));
    }

    protected function userWithPermission(): User
    {
        $role = Role::findOrCreate('user-manager', 'api');
        $role->syncPermissions([UserPermission::Manage->value]);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
