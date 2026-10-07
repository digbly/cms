<?php

namespace App\Http\Middleware;

use App\Facades\Menu;
use App\Support\AdminTranslations;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template rendered on the first page visit.
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Props shared with every Inertia response.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $this->user($request),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
            'admin_menu' => fn () => $this->adminMenu($request),
            'admin_prefix' => config('app.admin_prefix', 'admin'),
            'locale' => app()->getLocale(),
            'translations' => fn () => $this->translations(),
            'routes' => fn () => $this->routes(),
        ];
    }

    /**
     * Serialisable representation of the authenticated user.
     *
     * @return array<string, mixed>|null
     */
    protected function user(Request $request): ?array
    {
        $user = $request->user();

        if ($user === null) {
            return null;
        }

        return [
            'id' => $user->getKey(),
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => method_exists($user, 'avatarUrl') ? $user->avatarUrl() : null,
            'is_super_admin' => method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin(),
            'permissions' => method_exists($user, 'permissionNames') ? $user->permissionNames() : [],
        ];
    }

    /**
     * Admin sidebar tree filtered by the current user's permissions.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function adminMenu(Request $request): array
    {
        $user = $request->user();
        $permissions = $user && method_exists($user, 'permissionNames')
            ? $user->permissionNames()
            : [];

        $isSuperAdmin = in_array('*', $permissions, true);

        $filter = function (Collection $items) use (&$filter, $isSuperAdmin, $permissions): array {
            return $items
                ->map(function (array $item) use ($filter): array {
                    $item['children'] = $filter(collect($item['children'] ?? []));

                    return $item;
                })
                ->filter(function (array $item) use ($isSuperAdmin, $permissions): bool {
                    $permission = $item['permission'] ?? null;
                    $granted = $permission === null
                        || $isSuperAdmin
                        || in_array($permission, $permissions, true);

                    // Keep granted items that are links or still have children.
                    return $granted && (($item['to'] ?? null) !== null || $item['children'] !== []);
                })
                ->values()
                ->all();
        };

        return $filter(Menu::tree('admin'));
    }

    /**
     * Admin translation namespaces keyed by frontend namespace.
     *
     * @return array<string, array<string, mixed>>
     */
    protected function translations(): array
    {
        $translations = app(AdminTranslations::class);
        $translations->registerNamespaces();

        return Cache::remember(
            'inertia.translations.'.app()->getLocale(),
            now()->addHour(),
            function () use ($translations): array {
                $payload = [];

                foreach (array_keys($translations->namespaces()) as $namespace) {
                    $lines = trans($translations->translationKey($namespace));

                    $payload[$namespace] = is_array($lines) ? $lines : [];
                }

                return $payload;
            }
        );
    }

    /**
     * Named route URIs keyed by route name.
     *
     * @return array<string, string>
     */
    protected function routes(): array
    {
        // Bounded cache: the route map only changes when a theme or module is
        // activated, so a short TTL keeps it fresh without rebuilding it on
        // every response.
        return Cache::remember(
            'inertia.routes.'.(theme_name() ?? 'default'),
            now()->addMinutes(5),
            fn (): array => collect(Route::getRoutes()->getRoutes())
                ->filter(fn ($route) => $route->getName() !== null)
                ->mapWithKeys(fn ($route) => [$route->getName() => '/'.ltrim($route->uri(), '/')])
                ->all()
        );
    }
}
