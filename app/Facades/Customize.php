<?php

namespace App\Facades;

use App\Support\Customizes\CustomizeRegistry;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void register(callable $callback)
 * @method static \App\Support\Customizes\Customize apply(\App\Support\Customizes\Customize $customize)
 *
 * @see CustomizeRegistry
 */
class Customize extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return CustomizeRegistry::class;
    }
}
