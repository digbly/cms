<?php

namespace App\Models;

use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    /**
     * Resolve a stored permission, returning null instead of throwing when the
     * permission has not been generated yet (Juzaweb-compatible leniency).
     *
     * @param  mixed  $permissions
     * @return mixed
     */
    protected function getStoredPermission($permissions)
    {
        try {
            return parent::getStoredPermission($permissions);
        } catch (PermissionDoesNotExist) {
            return null;
        }
    }

    /**
     * Revoke a permission, ignoring permissions that do not exist.
     *
     * @param  mixed  $permission
     * @return $this
     */
    public function revokePermissionTo($permission)
    {
        if ($this->getStoredPermission($permission) === null) {
            return $this;
        }

        return parent::revokePermissionTo($permission);
    }
}
