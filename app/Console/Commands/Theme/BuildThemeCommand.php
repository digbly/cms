<?php

namespace App\Console\Commands\Theme;

use App\Themes\Exceptions\ThemeNotFoundException;
use App\Themes\FileRepository;
use App\Themes\Theme;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class BuildThemeCommand extends Command
{
    protected $signature = 'theme:build
        {theme? : The theme to build, defaults to all themes}
        {--dev : Run the Vite dev server instead of a production build}';

    protected $description = 'Build a theme frontend with its own Vite config';

    public function handle(FileRepository $repository): int
    {
        try {
            $themes = $this->argument('theme')
                ? [$repository->findOrFail($this->argument('theme'))]
                : array_values($repository->all());
        } catch (ThemeNotFoundException $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        if (empty($themes)) {
            $this->components->warn('No themes found.');

            return self::SUCCESS;
        }

        $failed = false;

        foreach ($themes as $theme) {
            if (! $this->build($theme)) {
                $failed = true;
            }
        }

        return $failed ? self::FAILURE : self::SUCCESS;
    }

    protected function build(Theme $theme): bool
    {
        $path = $theme->getPath();

        if (! file_exists($path.'/package.json')) {
            $this->components->warn("Theme [{$theme->getName()}] has no package.json, skipping.");

            return true;
        }

        $script = $this->option('dev') ? 'dev' : 'build';

        $this->components->info("Building [{$theme->getName()}] with `npm run {$script}`...");

        $process = Process::path($path);

        if (! $this->option('dev')) {
            $process = $process->timeout(300);
        }

        $result = $process->run(['npm', 'run', $script]);

        if ($result->failed()) {
            $this->components->error("Build failed for [{$theme->getName()}].");
            $this->line($result->errorOutput() ?: $result->output());

            return false;
        }

        $this->components->info("Built assets for [{$theme->getName()}].");

        return true;
    }
}
