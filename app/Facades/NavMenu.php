<?php

namespace App\Facades;

use App\Contracts\NavMenu as NavMenuContract;
use App\Support\NavMenuRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void make(string $key, callable $callback)
 * @method static null|array get(string $key)
 * @method static Collection all()
 *
 * @see NavMenuRepository
 */
class NavMenu extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return NavMenuContract::class;
    }
}
