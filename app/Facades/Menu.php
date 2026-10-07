<?php

namespace App\Facades;

use App\Contracts\Menu as MenuContract;
use App\Support\MenuRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void make(string $key, callable $callback)
 * @method static null|array get(string $key)
 * @method static Collection getByPosition(string $position)
 * @method static Collection tree(string $position)
 * @method static Collection all()
 *
 * @see MenuRepository
 */
class Menu extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return MenuContract::class;
    }
}
