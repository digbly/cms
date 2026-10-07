<?php

namespace App\Contracts;

use App\Models\ThemeSetting as ThemeSettingModel;
use App\Support\Entities\ThemeSetting as ThemeSettingEntity;
use App\Support\ThemeSettingRepository;
use Illuminate\Support\Collection;

/**
 * @see ThemeSettingRepository
 */
interface ThemeSetting
{
    public function make(string $key): ThemeSettingEntity;

    public function get(string $key, mixed $default = null): mixed;

    public function boolean(string $key, mixed $default = null): ?bool;

    public function integer(string $key, mixed $default = null): ?int;

    public function float(string $key, mixed $default = null): ?float;

    public function set(string $key, mixed $value = null): ThemeSettingModel;

    public function sets(array $keys): Collection;

    public function gets(array $keys, mixed $default = null): array;

    public function all(): Collection;

    public function keys(?array $keys = null): Collection;

    public function settings(): Collection;

    public function configs(): Collection;
}
