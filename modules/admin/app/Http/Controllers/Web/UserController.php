<?php

namespace Modules\Admin\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Enums\UserPermission;
use Modules\Admin\Http\Requests\Admin\IndexUserRequest;
use Modules\Admin\Http\Requests\Admin\ResetUserPasswordRequest;
use Modules\Admin\Http\Requests\Admin\StoreUserRequest;
use Modules\Admin\Http\Requests\Admin\UpdateUserRequest;
use Modules\Admin\Http\Resources\UserResource;
use Modules\Auth\Models\User;

/**
 * Inertia-facing user management.
 *
 * The mutation logic mirrors {@see \Modules\Admin\Http\Controllers\Admin\UserController}
 * (the JSON API). Extracting it into a shared action is planned; keeping it
 * here avoids coupling the web layer to the API resource responses.
 */
class UserController extends Controller
{
    public function index(IndexUserRequest $request): Response
    {
        $filters = $request->validated() + [
            'search' => null,
            'role' => null,
            'trashed' => null,
            'sort' => 'created_at',
            'direction' => 'desc',
        ];

        $users = User::query()
            ->with($this->resourceRelations())
            ->when($filters['trashed'] === 'only', fn ($query) => $query->onlyTrashed())
            ->when($filters['trashed'] === 'with', fn ($query) => $query->withTrashed())
            ->when($filters['search'], function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(
                $filters['role'],
                fn ($query, string $role) => $query->whereHas('roles', fn ($query) => $query->where('name', $role))
            )
            ->orderBy($filters['sort'], $filters['direction'])
            ->paginate((int) $request->validated('per_page', 15))
            ->withQueryString();

        return Inertia::render('Admin::users/Index', [
            'title' => __('admin.nav.users'),
            'users' => UserResource::collection($users),
            'filters' => [
                'search' => $filters['search'],
                'role' => $filters['role'],
                'trashed' => $filters['trashed'],
            ],
            'roles' => $this->roleNames(),
            'selfId' => $request->user()->getKey(),
            'canManageSuperAdmin' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Admin::users/Form', [
            'title' => __('admin.users.form.createTitle'),
            'user' => null,
            'roles' => $this->roleNames(),
            'canManageSuperAdmin' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $actor = $request->user();

        if (($data['is_super_admin'] ?? false) && ! $actor->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'is_super_admin' => __('admin.users.errors.superAdminGrant'),
            ]);
        }

        DB::transaction(function () use ($data): void {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'is_super_admin' => (bool) ($data['is_super_admin'] ?? false),
            ]);

            $user->syncRoles($data['roles'] ?? []);
        });

        return redirect()
            ->route('admin.users.index')
            ->with('success', __('admin.users.notices.created'));
    }

    public function edit(Request $request, User $user): Response
    {
        return Inertia::render('Admin::users/Form', [
            'title' => __('admin.users.form.editTitle'),
            'user' => UserResource::make($user->load($this->resourceRelations()))->resolve(),
            'roles' => $this->roleNames(),
            'canManageSuperAdmin' => $request->user()->isSuperAdmin(),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->ensureCanManage($request, $user);

        $data = $request->validated();
        $actor = $request->user();

        if ($request->has('is_super_admin')
            && (bool) $data['is_super_admin'] !== $user->isSuperAdmin()
            && ! $actor->isSuperAdmin()
        ) {
            throw ValidationException::withMessages([
                'is_super_admin' => __('admin.users.errors.superAdminChange'),
            ]);
        }

        DB::transaction(function () use ($request, $user, $data, $actor): void {
            $user->update(['name' => $data['name'], 'email' => $data['email']]);

            if ($request->has('roles')) {
                $user->syncRoles($data['roles'] ?? []);
            }

            if ($request->has('is_super_admin')) {
                $user->is_super_admin = (bool) $data['is_super_admin'];
                $user->save();
            }

            if ($actor->is($user)) {
                $fresh = $user->fresh();
                $canManage = $fresh->isSuperAdmin()
                    || in_array(UserPermission::Manage->value, $fresh->permissionNames(), true);

                if (! $canManage) {
                    throw ValidationException::withMessages([
                        'roles' => __('admin.users.errors.selfLockout'),
                    ]);
                }
            }
        });

        return back()->with('success', __('admin.users.notices.updated'));
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        $this->ensureCanManage($request, $user);

        if ($request->user()->is($user)) {
            throw ValidationException::withMessages([
                'user' => __('admin.users.errors.selfDelete'),
            ]);
        }

        $user->delete();

        return back()->with('success', __('admin.users.notices.deleted'));
    }

    public function restore(Request $request, User $user): RedirectResponse
    {
        $this->ensureCanManage($request, $user);

        if ($user->trashed()) {
            $user->restore();
        }

        return back()->with('success', __('admin.users.notices.restored'));
    }

    public function resetPassword(ResetUserPasswordRequest $request, User $user): RedirectResponse
    {
        $this->ensureCanManage($request, $user);

        $user->forceFill(['password' => $request->validated('password')])->save();

        return back()->with('success', __('admin.users.notices.passwordReset'));
    }

    public function resendVerification(Request $request, User $user): RedirectResponse
    {
        $this->ensureCanManage($request, $user);

        if ($user->hasVerifiedEmail()) {
            throw ValidationException::withMessages([
                'email' => __('admin.users.errors.alreadyVerified'),
            ]);
        }

        $user->sendEmailVerificationNotification();

        return back()->with('success', __('admin.users.notices.verificationSent'));
    }

    /**
     * @return list<string>
     */
    protected function roleNames(): array
    {
        return Role::query()->orderBy('name')->pluck('name')->all();
    }

    /**
     * @return list<string>
     */
    protected function resourceRelations(): array
    {
        return ['roles', 'permissions', 'roles.permissions'];
    }

    protected function ensureCanManage(Request $request, User $target): void
    {
        if ($target->isSuperAdmin() && ! $request->user()->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'user' => __('admin.users.errors.cannotManageSuperAdmin'),
            ]);
        }
    }
}
