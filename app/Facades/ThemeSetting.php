<?php

namespace App\Facades;

use App\Contracts\ThemeSetting as ThemeSettingContract;
use App\Support\ThemeSettingRepository;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Support\Entities\ThemeSetting make(string $key)
 * @method static mixed get(string $key, mixed $default = null)
 * @method static \App\Models\ThemeSetting set(string $key, mixed $value = null)
 * @method static \Illuminate\Support\Collection sets(array $keys)
 * @method static array gets(array $keys, mixed $default = null)
 * @method static bool|null boolean(string $key, mixed $default = null)
 * @method static int|null integer(string $key, mixed $default = null)
 * @method static float|null float(string $key, mixed $default = null)
 * @method static \Illuminate\Support\Collection all()
 * @method static \Illuminate\Support\Collection keys(?array $keys = null)
 * @method static \Illuminate\Support\Collection settings()
 * @method static \Illuminate\Support\Collection configs()
 *
 * @see ThemeSettingRepository
 */
class ThemeSetting extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ThemeSettingContract::class;
    }
}
