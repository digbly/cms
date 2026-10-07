<?php

namespace App\Facades;

use App\Contracts\AdminTranslation as AdminTranslationContract;
use App\Support\AdminTranslationRepository;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void make(string $namespace, callable $callback)
 * @method static null|array{group: string, path?: string} get(string $namespace)
 * @method static array<string, array{group: string, path?: string}> all()
 *
 * @see AdminTranslationRepository
 */
class AdminTranslation extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return AdminTranslationContract::class;
    }
}
