<?php

namespace Themes\Default\Http\Controllers;

use App\Support\SidebarRenderer;
use Illuminate\Routing\Controller as BaseController;
use Inertia\Inertia;
use Inertia\Response;
use Themes\Default\Support\BrandData;
use Themes\Default\Support\NavigationData;

abstract class Controller extends BaseController
{
    /**
     * Render a theme Inertia page with the props every theme page shares.
     *
     * @param  array<string, mixed>  $props
     */
    protected function render(string $component, array $props = []): Response
    {
        return Inertia::render($component, array_merge([
            'siteName' => fn () => app(BrandData::class)->name(),
            'siteLogo' => fn () => app(BrandData::class)->logoUrl(),
            'messages' => fn () => trans('default::messages'),
            'navMenu' => fn () => app(NavigationData::class)->menu('primary'),
            'sidebarWidgets' => fn () => app(SidebarRenderer::class)->payload('sidebar'),
        ], $props))->rootView('default::theme');
    }
}
