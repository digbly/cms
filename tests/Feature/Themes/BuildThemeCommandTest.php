<?php

namespace Tests\Feature\Themes;

use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class BuildThemeCommandTest extends TestCase
{
    public function test_it_builds_the_requested_theme(): void
    {
        Process::fake();

        $this->artisan('theme:build', ['theme' => 'Default'])
            ->assertSuccessful();

        Process::assertRan(function ($process): bool {
            $command = implode(' ', (array) $process->command);

            return str_contains($command, 'npm run build');
        });
    }

    public function test_dev_flag_runs_the_dev_server_script(): void
    {
        Process::fake();

        $this->artisan('theme:build', ['theme' => 'Default', '--dev' => true])
            ->assertSuccessful();

        Process::assertRan(fn ($process): bool => str_contains(
            implode(' ', (array) $process->command),
            'npm run dev'
        ));
    }

    public function test_unknown_theme_fails(): void
    {
        Process::fake();

        $this->artisan('theme:build', ['theme' => 'DoesNotExist'])
            ->assertFailed();

        Process::assertNothingRan();
    }
}
