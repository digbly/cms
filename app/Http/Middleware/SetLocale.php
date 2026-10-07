<?php

namespace App\Http\Middleware;

use App\Models\Language;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Resolve the request locale from the `multiple_language` setting.
     *
     * Supported modes (mirroring the site settings):
     *  - none:      single language, the configured default.
     *  - session:   the `hl` query parameter or the value stored in session.
     *  - prefix:    the first path segment when it matches a known language.
     *  - subdomain: the language-shaped left-most subdomain.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($locale = $this->resolveLocale($request)) {
            app()->setLocale($locale);
            config(['app.locale' => $locale]);
            config(['translatable.locale' => $locale]);
        }

        // The locale is only an addressing concern. Dropping it from the route
        // parameters keeps it out of controller parameter resolution, which is
        // positional for scalar arguments.
        $request->route()?->forgetParameter('locale');

        return $next($request);
    }

    protected function resolveLocale(Request $request): ?string
    {
        $mode = setting('multiple_language', 'none');
        $default = Language::default();

        if ($mode === 'session') {
            return $request->get('hl') ?? session('locale', $default);
        }

        if ($mode === 'prefix') {
            $segment = $request->segment(1);

            return is_string($segment) && Language::existsCode($segment)
                ? $segment
                : $default;
        }

        if ($mode === 'subdomain') {
            $subdomain = explode('.', $request->getHost())[0];

            return Language::existsCode($subdomain) ? $subdomain : $default;
        }

        return $default;
    }
}
