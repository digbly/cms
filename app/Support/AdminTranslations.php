<?php

namespace App\Support;

use App\Facades\AdminTranslation;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Str;

/**
 * Resolves where the admin SPA translation namespaces live. Namespaces are
 * registered by their owner (the application shell or a feature module) through
 * the {@see AdminTranslation} registry; this service turns them into the
 * payload the Inertia frontend and the settings screen consume.
 */
class AdminTranslations
{
    /**
     * @return array<string, array{group: string, path?: string}>
     */
    public function namespaces(): array
    {
        return AdminTranslation::all();
    }

    /**
     * Backend language group for a frontend namespace.
     */
    public function group(string $namespace): string
    {
        return $this->namespaces()[$namespace]['group'];
    }

    /**
     * Translation key (`group` or `namespace::group`) used to resolve a
     * namespace through the translator. Module-owned namespaces are resolved
     * through their own translation namespace; application namespaces resolve
     * against the global `resources/lang`.
     */
    public function translationKey(string $namespace): string
    {
        $group = $this->namespaces()[$namespace]['group'] ?? $namespace;

        return $this->path($namespace) !== null ? $namespace.'::'.$group : $group;
    }

    /**
     * Resolve the language directory of a module-owned namespace, falling back
     * to the `modules/<Studly>/resources/lang` convention when one is not
     * given explicitly. Returns null for application-level namespaces.
     */
    public function path(string $namespace): ?string
    {
        $definition = $this->namespaces()[$namespace] ?? [];

        if (array_key_exists('path', $definition) && $definition['path'] !== null) {
            return $definition['path'];
        }

        $module = Str::studly($namespace);

        if (app('modules')->find($module) === null) {
            return null;
        }

        $path = module_path($module, config('modules.paths.generator.lang.path'));

        return File::isDirectory($path) ? $path : null;
    }

    /**
     * Register every module-owned language directory as a translation
     * namespace. The owning provider only boots when the module is enabled, so
     * this mirrors the namespace registry itself.
     */
    public function registerNamespaces(): void
    {
        foreach (array_keys($this->namespaces()) as $namespace) {
            $path = $this->path($namespace);

            if ($path !== null && File::isDirectory($path)) {
                Lang::addNamespace($namespace, $path);
            }
        }
    }

    /**
     * Every locale that ships admin translations, from the application and any
     * owning module, so a locale added to either place is exposed.
     *
     * @return list<string>
     */
    public function locales(): array
    {
        $directories = collect([lang_path(), ...$this->moduleLangPaths()]);

        return $directories
            ->filter(fn (string $directory) => File::isDirectory($directory))
            ->flatMap(fn (string $directory) => File::directories($directory))
            ->map(fn (string $directory) => basename($directory))
            ->reject(fn (string $locale) => $locale === 'vendor')
            ->unique()
            ->sort()
            ->values()
            ->all();
    }

    /**
     * Language directories owned by the registered module namespaces.
     *
     * @return list<string>
     */
    protected function moduleLangPaths(): array
    {
        return collect(array_keys($this->namespaces()))
            ->map(fn (string $namespace): ?string => $this->path($namespace))
            ->filter()
            ->values()
            ->all();
    }
}
