<?php

use App\Modules\ModulesServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\PermissionServiceProvider;
use App\Themes\ThemesServiceProvider;
use Modules\Admin\Providers\AdminServiceProvider;
use Modules\Auth\Providers\AuthServiceProvider;

return [
    AppServiceProvider::class,
    ModulesServiceProvider::class,

    // Core modules are always loaded. Every other module is loaded by
    // ModulesServiceProvider from the activator (database) settings.
    AdminServiceProvider::class,
    AuthServiceProvider::class,

    PermissionServiceProvider::class,
    ThemesServiceProvider::class,
];
