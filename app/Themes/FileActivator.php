<?php

namespace App\Themes;

use App\Contracts\ThemeActivator;
use Illuminate\Config\Repository as Config;
use Illuminate\Container\Container;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Filesystem\Filesystem;

class FileActivator implements ThemeActivator
{
    private Filesystem $files;

    private Config $config;

    private array $statuses;

    private string $statusesFile;

    public function __construct(Container $app)
    {
        $this->files = $app['files'];
        $this->config = $app['config'];
        $this->statusesFile = $this->config('statuses-file');
        $this->statuses = $this->readJson();
    }

    public function reset(): void
    {
        if ($this->files->exists($this->statusesFile)) {
            $this->files->delete($this->statusesFile);
        }

        $this->statuses = [];
    }

    public function enable(Theme $theme): void
    {
        $this->setActiveByName($theme->getName(), true);
    }

    public function disable(Theme $theme): void
    {
        $this->setActiveByName($theme->getName(), false);
    }

    public function hasStatus(Theme|string $theme, bool $status): bool
    {
        $name = $theme instanceof Theme ? $theme->getName() : $theme;

        if (! isset($this->statuses[$name])) {
            return $status === false;
        }

        return $this->statuses[$name] === $status;
    }

    public function setActive(Theme $theme, bool $active): void
    {
        $this->setActiveByName($theme->getName(), $active);
    }

    public function setActiveByName(string $name, bool $status): void
    {
        $this->statuses[$name] = $status;

        $this->writeJson();
    }

    public function delete(Theme $theme): void
    {
        if (! isset($this->statuses[$theme->getName()])) {
            return;
        }

        unset($this->statuses[$theme->getName()]);

        $this->writeJson();
    }

    private function writeJson(): void
    {
        $this->files->put($this->statusesFile, json_encode($this->statuses, JSON_PRETTY_PRINT));
    }

    /**
     * @throws FileNotFoundException
     */
    private function readJson(): array
    {
        if (! $this->files->exists($this->statusesFile)) {
            return [];
        }

        return $this->files->json($this->statusesFile);
    }

    private function config(string $key, mixed $default = null): mixed
    {
        return $this->config->get('themes.activators.file.'.$key, $default);
    }
}
