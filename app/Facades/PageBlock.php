<?php

namespace App\Facades;

use App\Contracts\PageBlock as PageBlockContract;
use App\Support\Entities\PageBlock as PageBlockEntity;
use App\Support\PageBlockRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void make(string $key, callable $callback)
 * @method static null|PageBlockEntity get(string $key)
 * @method static Collection all()
 *
 * @see PageBlockRepository
 */
class PageBlock extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return PageBlockContract::class;
    }
}
