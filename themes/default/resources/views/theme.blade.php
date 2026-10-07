<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        @if (Vite::isRunningHot() || file_exists(public_path('themes/default/manifest.json')))
            @viteReactRefresh
            @vite('resources/views/app.tsx', 'themes/default')
        @endif

        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-slate-50 text-slate-800">
        @inertia
    </body>
</html>
