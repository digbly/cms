<?php

namespace Tests\Unit\Support;

use App\Support\HtmlSanitizer;
use PHPUnit\Framework\TestCase;

class HtmlSanitizerTest extends TestCase
{
    private HtmlSanitizer $sanitizer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sanitizer = new HtmlSanitizer;
    }

    public function test_it_keeps_allowed_formatting(): void
    {
        $html = '<p>Hello <strong>world</strong></p>';

        $this->assertSame($html, $this->sanitizer->sanitize($html));
    }

    public function test_it_drops_scripts_and_event_handlers(): void
    {
        $sanitized = $this->sanitizer->sanitize('<script>alert(1)</script><p onclick="evil()">Safe</p>');

        $this->assertStringNotContainsString('<script', $sanitized);
        $this->assertStringNotContainsString('onclick', $sanitized);
        $this->assertStringContainsString('Safe', $sanitized);
    }

    public function test_it_rejects_dangerous_url_schemes(): void
    {
        $sanitized = $this->sanitizer->sanitize('<a href="javascript:alert(1)">x</a>');

        $this->assertStringNotContainsString('javascript', $sanitized);
        $this->assertStringContainsString('<a', $sanitized);
    }

    public function test_it_keeps_safe_links_and_adds_rel_for_blank_target(): void
    {
        $sanitized = $this->sanitizer->sanitize('<a href="https://example.com" target="_blank">ok</a>');

        $this->assertStringContainsString('href="https://example.com"', $sanitized);
        $this->assertStringContainsString('rel="noopener noreferrer"', $sanitized);
    }

    public function test_it_unwraps_unknown_tags_and_keeps_text(): void
    {
        $sanitized = $this->sanitizer->sanitize('<div><blink>weird</blink></div>');

        $this->assertStringNotContainsString('blink', $sanitized);
        $this->assertStringContainsString('weird', $sanitized);
    }

    public function test_it_strips_non_text_align_styles(): void
    {
        $sanitized = $this->sanitizer->sanitize('<p style="text-align:center;color:red">Aligned</p>');

        $this->assertStringContainsString('text-align: center', $sanitized);
        $this->assertStringNotContainsString('color', $sanitized);
    }

    public function test_it_returns_empty_string_for_blank_input(): void
    {
        $this->assertSame('', $this->sanitizer->sanitize(null));
        $this->assertSame('', $this->sanitizer->sanitize('   '));
    }
}
