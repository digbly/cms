<?php

namespace App\Console\Commands\Theme;

use App\Themes\Exceptions\ThemeNotFoundException;
use App\Themes\FileRepository;
use Illuminate\Console\Command;

class EnableThemeCommand extends Command
{
    protected $signature = 'theme:enable {theme : The theme name}';

    protected $description = 'Enable a theme';

    public function handle(FileRepository $repository): int
    {
        try {
            $theme = $repository->findOrFail($this->argument('theme'));
        } catch (ThemeNotFoundException $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $theme->enable();

        $this->components->info("Theme [{$theme->getName()}] enabled.");

        return self::SUCCESS;
    }
}
