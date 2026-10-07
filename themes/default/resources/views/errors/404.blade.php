@php
    $routes = collect(\Illuminate\Support\Facades\Route::getRoutes()->getRoutes())
        ->filter(fn ($route) => $route->getName() !== null)
        ->mapWithKeys(fn ($route) => [$route->getName() => '/'.ltrim($route->uri(), '/')])
        ->all();

    $brand = app(\Themes\Default\Support\BrandData::class);

    $page = [
        'component' => 'NotFound',
        'props' => [
            'siteName' => $brand->name(),
            'siteLogo' => $brand->logoUrl(),
            'messages' => trans('default::messages'),
            'navMenu' => app(\Themes\Default\Support\NavigationData::class)->menu('primary'),
            'sidebarWidgets' => [],
            'routes' => $routes,
        ],
        'url' => request()->getRequestUri(),
        'version' => null,
        'clearHistory' => false,
        'encryptHistory' => false,
    ];
@endphp

{!! view('default::theme', ['page' => $page])->render() !!}
