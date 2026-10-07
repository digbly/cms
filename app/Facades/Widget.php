<?php

namespace App\Facades;

use App\Contracts\Widget as WidgetContract;
use App\Support\Entities\Widget as WidgetEntity;
use App\Support\WidgetRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void make(string $key, callable $callback)
 * @method static null|WidgetEntity get(string $key)
 * @method static Collection all()
 *
 * @see WidgetRepository
 */
class Widget extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return WidgetContract::class;
    }
}
