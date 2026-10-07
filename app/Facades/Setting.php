<?php

namespace App\Facades;

use App\Contracts\Setting as SettingContract;
use App\Support\SettingRepository;
use Illuminate\Support\Facades\Facade;

/**
 * @method static \App\Support\Entities\Setting make(string $key)
 * @method static \App\Contracts\Setting locale(string $locale)
 * @method static mixed get(string $key, mixed $default = null)
 * @method static \App\Models\Setting set(string $key, mixed $value = null)
 * @method static \Illuminate\Support\Collection sets(array $keys)
 * @method static array gets(array $keys, mixed $default = null)
 * @method static bool|null boolean(string $key, mixed $default = null)
 * @method static int|null integer(string $key, mixed $default = null)
 * @method static float|null float(string $key, mixed $default = null)
 * @method static \Illuminate\Support\Collection all()
 * @method static \Illuminate\Support\Collection keys(?array $keys = null)
 * @method static \Illuminate\Support\Collection settings()
 * @method static \Illuminate\Support\Collection localized()
 * @method static \Illuminate\Support\Collection configs()
 *
 * @see SettingRepository
 */
class Setting extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return SettingContract::class;
    }
}
