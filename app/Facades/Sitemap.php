<?php

namespace App\Facades;

use App\Contracts\Sitemap as SitemapContract;
use App\Support\SitemapRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void register(string $key, string $class)
 * @method static Collection all()
 * @method static string|null get(string $key)
 *
 * @see SitemapRepository
 */
class Sitemap extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return SitemapContract::class;
    }
}
