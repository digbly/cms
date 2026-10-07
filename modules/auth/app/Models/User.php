<?php

namespace Modules\Auth\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\Contracts\OAuthenticatable;
use Laravel\Passport\HasApiTokens;
use Modules\Auth\Database\Factories\UserFactory;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Exceptions\PermissionDoesNotExist;
use Spatie\Permission\Traits\HasRoles;

#[UseFactory(UserFactory::class)]
class User extends Authenticatable implements HasMedia, MustVerifyEmail, OAuthenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, InteractsWithMedia, Notifiable, SoftDeletes;

    use HasRoles {
        getStoredPermission as protected spatieGetStoredPermission;
        revokePermissionTo as protected spatieRevokePermissionTo;
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_super_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')->singleFile();
    }

    public function avatarUrl(): ?string
    {
        return $this->getFirstMediaUrl('avatar') ?: null;
    }

    public function socialConnections(): HasMany
    {
        return $this->hasMany(UserSocialConnection::class);
    }

    public function isSuperAdmin(): bool
    {
        return (bool) $this->is_super_admin;
    }

    /**
     * Permission names granted to the user.
     *
     * Super admins are represented by a wildcard so the frontend can treat
     * every permission as granted without loading the whole permission table.
     *
     * @return list<string>
     */
    public function permissionNames(): array
    {
        if ($this->isSuperAdmin()) {
            return ['*'];
        }

        return $this->getAllPermissions()
            ->pluck('name')
            ->values()
            ->all();
    }

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
            return $this->spatieGetStoredPermission($permissions);
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

        return $this->spatieRevokePermissionTo($permission);
    }
}
