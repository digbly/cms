<?php

namespace App\Console\Commands\Theme;

use App\Themes\FileRepository;
use App\Themes\Theme;
use Illuminate\Console\Command;

class ListThemesCommand extends Command
{
    protected $signature = 'theme:list
        {--only= : Filter by status (enabled or disabled)}';

    protected $description = 'List all themes';

    public function handle(FileRepository $repository): int
    {
        $themes = match ($this->option('only')) {
            'enabled' => $repository->allEnabled(),
            'disabled' => $repository->allDisabled(),
            default => $repository->all(),
        };

        if (empty($themes)) {
            $this->components->warn('No themes found.');

            return self::SUCCESS;
        }

        $rows = array_map(fn (Theme $theme) => [
            $theme->getName(),
            $theme->getLowerName(),
            $theme->isEnabled() ? '<fg=green>Enabled</>' : '<fg=red>Disabled</>',
            $theme->get('priority'),
            $theme->getPath(),
        ], $themes);

        $this->table(['Name', 'Alias', 'Status', 'Priority', 'Path'], $rows);

        return self::SUCCESS;
    }
}
