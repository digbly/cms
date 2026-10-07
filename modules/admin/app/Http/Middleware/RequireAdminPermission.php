<?php

namespace Modules\Admin\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Authorise an admin web request against a single permission.
 *
 * Super admins bypass the check; everyone else must hold the permission.
 */
class RequireAdminPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        abort_if($user === null, 403);

        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        abort_unless(in_array($permission, $user->permissionNames(), true), 403);

        return $next($request);
    }
}
