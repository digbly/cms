<?php

namespace Tests\Feature\Themes;

use Illuminate\Support\Facades\Process;
use Tests\TestCase;

class SsrThemeCommandTest extends TestCase
{
    public function test_unknown_theme_fails(): void
    {
        Process::fake();

        $this->artisan('theme:ssr', ['theme' => 'DoesNotExist'])
            ->assertFailed();

        Process::assertNothingRan();
    }
}
