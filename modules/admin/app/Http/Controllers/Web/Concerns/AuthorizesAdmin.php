<?php

namespace Modules\Admin\Http\Controllers\Web\Concerns;

use Illuminate\Http\Request;

/**
 * Inertia admin pages expose per-action abilities so the UI can hide controls
 * the current user cannot use. Super admins implicitly hold every permission.
 */
trait AuthorizesAdmin
{
    protected function allows(Request $request, string $permission): bool
    {
        $user = $request->user();

        return $user->isSuperAdmin()
            || in_array($permission, $user->permissionNames(), true);
    }
}
