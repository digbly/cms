<?php

namespace App\Console\Commands;

use App\Models\Permission;
use App\Support\PermissionRegistry;
use Illuminate\Console\Command;
use Spatie\Permission\PermissionRegistrar;

class PermissionGenerateCommand extends Command
{
    protected $signature = 'permission:generate';

    protected $description = 'Generate application permissions from the registry';

    public function handle(PermissionRegistry $registry): int
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $guard = config('auth.defaults.guard', 'api');

        foreach ($registry->all() as $permission) {
            Permission::query()->firstOrCreate([
                'name' => $permission,
                'guard_name' => $guard,
            ]);
        }

        $this->info('Permissions generated successfully.');

        return self::SUCCESS;
    }
}
