<?php

namespace App\Support;

class PermissionRegistry
{
    /**
     * @var array<string, true>
     */
    protected array $permissions = [];

    /**
     * @param  string|array<int, string>  $permissions
     */
    public function register(string|array $permissions): static
    {
        foreach ((array) $permissions as $permission) {
            $this->permissions[$permission] = true;
        }

        return $this;
    }

    /**
     * @return list<string>
     */
    public function all(): array
    {
        return array_keys($this->permissions);
    }
}
