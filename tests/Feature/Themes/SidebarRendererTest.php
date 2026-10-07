<?php

namespace Tests\Feature\Themes;

use App\Facades\Widget;
use App\Support\SidebarRenderer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SidebarRendererTest extends TestCase
{
    use RefreshDatabase;

    public function test_component_only_widgets_are_excluded_from_html_rendering(): void
    {
        Widget::make('call-to-action', fn () => [
            'label' => 'Call to action',
            'component' => 'Widgets/CallToAction',
            'only' => ['sidebar'],
        ]);

        $renderer = app(SidebarRenderer::class);

        $this->assertSame([], $renderer->render('sidebar'));

        $payload = $renderer->payload('sidebar');

        $this->assertCount(1, $payload);
        $this->assertSame('call-to-action', $payload[0]['key']);
        $this->assertSame('Widgets/CallToAction', $payload[0]['component']);
    }

    public function test_view_only_widgets_are_excluded_from_the_payload(): void
    {
        Widget::make('legacy', fn () => [
            'label' => 'Legacy',
            'view' => 'default::legacy',
            'only' => ['sidebar'],
        ]);

        $renderer = app(SidebarRenderer::class);

        $this->assertSame([], $renderer->payload('sidebar'));
    }
}
