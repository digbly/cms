<?php

namespace App\Console\Commands\Theme;

use App\Themes\Exceptions\ThemeNotFoundException;
use App\Themes\FileRepository;
use App\Themes\Theme;
use Illuminate\Console\Command;
use Illuminate\Support\Arr;
use Symfony\Component\Process\Process;

class SsrThemeCommand extends Command
{
    protected $signature = 'theme:ssr
        {theme? : The theme to serve, defaults to the active theme}
        {--runtime=node : The runtime to use (`node` or `bun`)}';

    protected $description = "Start a theme's Inertia SSR server";

    public function handle(FileRepository $repository): int
    {
        try {
            $theme = $this->resolveTheme($repository);
        } catch (ThemeNotFoundException $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        if ($theme === null) {
            $this->components->error('No theme is available to serve.');

            return self::FAILURE;
        }

        $settings = $theme->ssrSettings();

        if (! $settings['enabled']) {
            $this->components->error("SSR is disabled for [{$theme->getName()}].");

            return self::FAILURE;
        }

        if (! is_file($settings['bundle'])) {
            $this->components->error("SSR bundle not found for [{$theme->getName()}] at: {$settings['bundle']}");
            $this->components->info("Build it first with `php artisan theme:build {$theme->getName()}`.");

            return self::FAILURE;
        }

        $runtime = (string) $this->option('runtime');

        if (! in_array($runtime, ['node', 'bun'], true)) {
            $this->components->error("Unsupported runtime: \"{$runtime}\". Supported runtimes are `node` and `bun`.");

            return self::INVALID;
        }

        $this->components->info("Starting SSR server for [{$theme->getName()}] on {$settings['host']}:{$settings['port']}...");

        $process = new Process([$runtime, $settings['bundle']], null, [
            'SSR_PORT' => (string) $settings['port'],
            'SSR_HOST' => $settings['host'],
        ]);
        $process->setTimeout(null);
        $process->start();

        if (extension_loaded('pcntl')) {
            $stop = fn () => $process->stop();
            pcntl_async_signals(true);
            pcntl_signal(SIGINT, $stop);
            pcntl_signal(SIGQUIT, $stop);
            pcntl_signal(SIGTERM, $stop);
        }

        foreach ($process as $type => $data) {
            if ($process::OUT === $type) {
                $this->info(trim($data));
            } else {
                $this->error(trim($data));
            }
        }

        return self::SUCCESS;
    }

    protected function resolveTheme(FileRepository $repository): ?Theme
    {
        if ($this->argument('theme')) {
            return $repository->findOrFail($this->argument('theme'));
        }

        return theme() ?? Arr::first($repository->allEnabled());
    }
}
