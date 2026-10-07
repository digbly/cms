<?php

namespace Tests\Unit\Auth;

use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Auth\Models\User;
use Tests\TestCase;

class UserPermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('permission:generate');
    }

    public function test_super_admin_receives_wildcard_permission(): void
    {
        $user = User::factory()->create(['is_super_admin' => true]);

        $this->assertSame(['*'], $user->permissionNames());
    }

    public function test_user_without_roles_receives_no_permissions(): void
    {
        $user = User::factory()->create();

        $this->assertSame([], $user->permissionNames());
    }

    public function test_permissions_come_from_assigned_roles(): void
    {
        $role = Role::findOrCreate('editor', 'api');
        $role->syncPermissions(['users.manage']);

        $user = User::factory()->create();
        $user->assignRole($role);

        $this->assertSame(['users.manage'], $user->permissionNames());
    }

    public function test_assigning_unknown_permission_is_skipped(): void
    {
        $role = Role::findOrCreate('editor', 'api');

        $role->syncPermissions(['unknown.permission']);

        $this->assertSame([], $role->permissions()->pluck('name')->all());
    }

    public function test_revoking_unknown_permission_keeps_existing_role_permissions(): void
    {
        $role = Role::findOrCreate('editor', 'api');
        $role->syncPermissions(['users.manage']);

        $role->revokePermissionTo('unknown.permission');

        $this->assertSame(['users.manage'], $role->permissions()->pluck('name')->all());
    }

    public function test_revoking_unknown_permission_keeps_existing_user_permissions(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('users.manage');

        $user->revokePermissionTo('unknown.permission');

        $this->assertSame(['users.manage'], $user->permissionNames());
    }
}
