<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class ThemeSsr
{
    /**
     * Point Inertia's SSR gateway at the active theme's bundle and server for
     * theme routes, leaving the application's own SSR configuration untouched.
     *
     * The active theme's Vite hot file is selected here as well, so a running
     * application Vite server cannot load its own front end on theme routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $theme = theme();

        if ($theme !== null) {
            Vite::useHotFile($theme->getHotFilePath());
            $theme->registerSsr();
        }

        return $next($request);
    }
}
