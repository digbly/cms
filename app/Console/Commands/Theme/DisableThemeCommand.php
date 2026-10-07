<?php

namespace App\Console\Commands\Theme;

use App\Themes\Exceptions\ThemeNotFoundException;
use App\Themes\FileRepository;
use Illuminate\Console\Command;

class DisableThemeCommand extends Command
{
    protected $signature = 'theme:disable {theme : The theme name}';

    protected $description = 'Disable a theme';

    public function handle(FileRepository $repository): int
    {
        try {
            $theme = $repository->findOrFail($this->argument('theme'));
        } catch (ThemeNotFoundException $e) {
            $this->components->error($e->getMessage());

            return self::FAILURE;
        }

        $theme->disable();

        $this->components->info("Theme [{$theme->getName()}] disabled.");

        return self::SUCCESS;
    }
}
