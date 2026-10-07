<?php

namespace App\Facades;

use App\Contracts\PageTemplate as PageTemplateContract;
use App\Support\Entities\PageTemplate as PageTemplateEntity;
use App\Support\PageTemplateRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void make(string $key, callable $callback)
 * @method static null|PageTemplateEntity get(string $key)
 * @method static Collection all()
 *
 * @see PageTemplateRepository
 */
class PageTemplate extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return PageTemplateContract::class;
    }
}
