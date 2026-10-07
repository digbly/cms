<?php

namespace App\Facades;

use App\Contracts\MenuBox as MenuBoxContract;
use App\Support\MenuBoxRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void make(string $key, string $class, callable $options)
 * @method static array get(string $position)
 * @method static Collection all()
 *
 * @see MenuBoxRepository
 */
class MenuBox extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return MenuBoxContract::class;
    }
}
