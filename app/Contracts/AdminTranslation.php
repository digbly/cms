<?php

namespace App\Contracts;

/**
 * Registry of the admin SPA translation namespaces. Modules register their own
 * namespace (with the backend language group and the directory holding the
 * files) from their service provider, so adding a module never requires
 * touching a central configuration file.
 */
interface AdminTranslation
{
    /**
     * Register a translation namespace.
     *
     * The callback returns a definition with a `group` and an optional `path`
     * to the language directory. When `path` is omitted the convention
     * `modules/<Studly(namespace)>/resources/lang` is used; a namespace without
     * a matching module directory is treated as an application-level group in
     * `resources/lang` (e.g. `common`).
     *
     *     ['group' => 'admin_auth', 'path' => module_path('Auth', 'resources/lang')]
     */
    public function make(string $namespace, callable $callback): void;

    /**
     * @return array{group: string, path?: string}|null
     */
    public function get(string $namespace): ?array;

    /**
     * @return array<string, array{group: string, path?: string}>
     */
    public function all(): array;
}
