<?php

namespace App\Console\Commands\Theme;

use App\Contracts\ThemeActivator;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

class MakeThemeCommand extends Command
{
    protected $signature = 'theme:make
        {name : The theme name}
        {--force : Overwrite the theme when it already exists}
        {--disabled : Do not enable the theme at creation}
        {--no-dump : Do not run composer dump-autoload after creating the theme}';

    protected $description = 'Create a new theme';

    public function handle(Filesystem $files, ThemeActivator $activator): int
    {
        $name = (string) $this->argument('name');

        if (! preg_match('/^[A-Za-z0-9][A-Za-z0-9 _-]*$/', $name)) {
            $this->components->error("Invalid theme name [{$name}]. Use letters, numbers, spaces, dashes or underscores.");

            return self::FAILURE;
        }

        $studly = Str::studly($name);
        $alias = Str::kebab($name);
        $slug = Str::slug($name);
        $directory = rtrim(config('themes.paths.themes'), '/').'/'.$slug;

        if ($files->isDirectory($directory) && ! $this->option('force')) {
            $this->components->error("Theme [{$studly}] already exists. Use --force to overwrite.");

            return self::FAILURE;
        }

        $replacements = [
            'studly' => $studly,
            'alias' => $alias,
            'vendor' => config('themes.composer.vendor', 'juzaweb'),
        ];

        $stubs = [
            'theme.json.stub' => 'theme.json',
            'composer.stub' => 'composer.json',
            'package.stub' => 'package.json',
            'vite.stub' => 'vite.config.js',
            'tsconfig.stub' => 'tsconfig.json',
            'provider.stub' => 'app/Providers/ThemeServiceProvider.php',
            'theme-view.stub' => 'resources/views/theme.blade.php',
            'app.stub' => 'resources/views/app.tsx',
            'ssr.stub' => 'resources/views/ssr.tsx',
            'resolve-page.stub' => 'resources/views/lib/resolve-page.ts',
            'route.stub' => 'resources/views/lib/route.ts',
            'page.stub' => 'resources/views/pages/Home.tsx',
            'config.stub' => 'config/config.php',
            'routes.stub' => 'routes/web.php',
            'app-css.stub' => 'resources/assets/css/app.css',
        ];

        foreach ($stubs as $stub => $target) {
            $path = $directory.'/'.$target;
            $files->ensureDirectoryExists(dirname($path));
            $files->put($path, $this->render($files, $stub, $replacements));
        }

        if (! $this->option('disabled')) {
            $activator->setActiveByName($studly, true);
        }

        $this->dumpAutoload();

        $this->components->info("Theme [{$studly}] created at themes/{$slug}.");

        return self::SUCCESS;
    }

    protected function dumpAutoload(): void
    {
        if ($this->option('no-dump') || $this->laravel->runningUnitTests()) {
            return;
        }

        Process::path(base_path())->command(['composer', 'dump-autoload'])->run();
    }

    protected function render(Filesystem $files, string $stub, array $replacements): string
    {
        $contents = $files->get(resource_path('stubs/themes/'.$stub));

        foreach ($replacements as $key => $value) {
            $contents = str_replace('{{ '.$key.' }}', $value, $contents);
        }

        return $contents;
    }
}
