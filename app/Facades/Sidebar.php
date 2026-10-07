<?php

namespace App\Facades;

use App\Contracts\Sidebar as SidebarContract;
use App\Support\Entities\Sidebar as SidebarEntity;
use App\Support\SidebarRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void make(string $key, callable $callback)
 * @method static null|SidebarEntity get(string $key)
 * @method static Collection all()
 *
 * @see SidebarRepository
 */
class Sidebar extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return SidebarContract::class;
    }
}
