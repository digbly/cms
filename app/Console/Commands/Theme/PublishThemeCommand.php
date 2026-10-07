<?php

namespace App\Console\Commands\Theme;

use App\Themes\Exceptions\ThemeNotFoundException;
use App\Themes\FileRepository;
use App\Themes\Theme;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;

class PublishThemeCommand extends Command
{
    protected $signature = 'theme:publish
        {theme? : The theme to publish, defaults to all themes}
        {--force : Delete the destination before publishing}';

    protected $description = 'Publish theme assets to public/themes';

    public function handle(FileRepository $repository, Filesystem $files): int
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

        foreach ($themes as $theme) {
            $this->publish($theme, $files);
        }

        return self::SUCCESS;
    }

    protected function publish(Theme $theme, Filesystem $files): void
    {
        $source = $theme->getAssetsPath();

        if (! is_dir($source)) {
            $this->components->warn("Theme [{$theme->getName()}] has no assets to publish.");

            return;
        }

        $destination = rtrim(config('themes.paths.assets'), '/').'/'.$theme->getLowerName();

        if ($this->option('force') && $files->isDirectory($destination)) {
            $files->deleteDirectory($destination);
        }

        $files->copyDirectory($source, $destination);

        $this->components->info("Published assets for [{$theme->getName()}] to public/themes/{$theme->getLowerName()}.");
    }
}
