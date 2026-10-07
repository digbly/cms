<?php

namespace App\Contracts;

use App\Models\Setting as SettingModel;
use App\Support\Entities\Setting as SettingEntity;
use App\Support\SettingRepository;
use Illuminate\Support\Collection;

/**
 * @see SettingRepository
 */
interface Setting
{
    public function locale(string $locale): static;

    public function make(string $key): SettingEntity;

    public function get(string $key, mixed $default = null): mixed;

    public function boolean(string $key, mixed $default = null): ?bool;

    public function integer(string $key, mixed $default = null): ?int;

    public function float(string $key, mixed $default = null): ?float;

    public function set(string $key, mixed $value = null): SettingModel;

    public function sets(array $keys): Collection;

    public function gets(array $keys, mixed $default = null): array;

    public function all(): Collection;

    public function keys(?array $keys = null): Collection;

    public function settings(): Collection;

    public function localized(): Collection;

    public function configs(): Collection;
}
