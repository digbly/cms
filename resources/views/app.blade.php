<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <script>
            (function () {
                try {
                    var stored = localStorage.getItem('admin-theme') || 'system';
                    var dark = stored === 'dark' ||
                        (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    var root = document.documentElement;
                    root.classList.toggle('dark', dark);
                    root.style.colorScheme = dark ? 'dark' : 'light';
                } catch (e) {}
            })();
        </script>

        @viteReactRefresh
        @vite('resources/views/app.tsx')
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
