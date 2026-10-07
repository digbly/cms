<?php

namespace App\Support;

use App\Contracts\ThemeSetting as ThemeSettingContract;
use App\Models\ThemeSetting as ThemeSettingModel;
use App\Support\Entities\ThemeSetting as ThemeSettingEntity;
use Illuminate\Contracts\Cache\Repository as CacheRepository;
use Illuminate\Support\Collection;

class ThemeSettingRepository implements ThemeSettingContract
{
    /**
     * Per-request memo of resolved configs so repeated `get()` calls do not
     * rebuild the collection on every read.
     *
     * @var Collection<string, mixed>|null
     */
    protected ?Collection $configsMemo = null;

    public function __construct(
        protected CacheRepository $cache
    ) {
        //
    }

    public function make(string $key): ThemeSettingEntity
    {
        return app(ThemeSettingEntity::class, ['key' => $key]);
    }

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->configs()->get($key) ?? $this->settings()->get($key)['default'] ?? $default;
    }

    public function boolean(string $key, mixed $default = null): ?bool
    {
        $value = $this->get($key, $default);

        if ($value === null) {
            return null;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    public function integer(string $key, mixed $default = null): ?int
    {
        $value = $this->get($key, $default);

        if ($value === null) {
            return null;
        }

        return (int) $value;
    }

    public function float(string $key, mixed $default = null): ?float
    {
        $value = $this->get($key, $default);

        if ($value === null) {
            return null;
        }

        return (float) $value;
    }

    public function set(string $key, mixed $value = null): ThemeSettingModel
    {
        $model = ThemeSettingModel::updateOrCreate(
            [
                'code' => $key,
                'theme' => theme_name(),
            ],
            [
                'value' => $value,
            ]
        );

        $this->flushCache();

        return $model;
    }

    public function sets(array $keys): Collection
    {
        foreach ($keys as $key => $value) {
            $this->set($key, $value);
        }

        return $this->configs()->only(array_keys($keys));
    }

    public function gets(array $keys, mixed $default = null): array
    {
        $data = [];

        foreach ($keys as $key) {
            $data[$key] = $this->get($key, $default);
        }

        return $data;
    }

    public function all(): Collection
    {
        $configs = $this->configs();

        return $this->settings()->map(
            fn ($setting) => $configs[$setting['key']] ?? $setting['default'] ?? null
        );
    }

    public function keys(?array $keys = null): Collection
    {
        if (is_null($keys)) {
            return $this->settings()->keys();
        }

        return $this->settings()->only($keys)->keys();
    }

    public function settings(): Collection
    {
        return new Collection(ThemeSettingsRegistry::all());
    }

    public function configs(): Collection
    {
        if ($this->configsMemo !== null) {
            return $this->configsMemo;
        }

        $settings = $this->cache->remember($this->cacheKey(), 3600, function () {
            return ThemeSettingModel::query()
                ->get()
                ->all();
        });

        return $this->configsMemo = (new Collection($settings))->mapWithKeys(
            fn (ThemeSettingModel $item) => [$item->code => $item->value]
        );
    }

    protected function cacheKey(): string
    {
        return sprintf('theme_settings.configs.%s', theme_name() ?? 'default');
    }

    protected function flushCache(): void
    {
        $this->cache->forget($this->cacheKey());
        $this->configsMemo = null;
    }
}
