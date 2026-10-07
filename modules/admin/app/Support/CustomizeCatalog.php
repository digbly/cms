<?php

namespace Modules\Admin\Support;

use App\Contracts\Setting as SettingContract;
use App\Contracts\ThemeSetting as ThemeSettingContract;
use App\Facades\PageBlock;
use App\Facades\PageTemplate;
use App\Models\Pages\Page;
use App\Models\Pages\PageBlock as PageBlockModel;
use App\Support\Customizes\Customize;
use App\Support\Customizes\CustomizeControl;
use App\Support\Customizes\CustomizeRegistry;
use Illuminate\Support\Collection;

/**
 * Read model for the customizer: the registered panels/sections/controls, the
 * current settings, the site pages and their templates/blocks.
 */
class CustomizeCatalog
{
    /**
     * @return array<string, mixed>
     */
    public function index(): array
    {
        $customize = new Customize;

        $customize->addSection('site_identity', [
            'title' => __('admin.customize.site_identity'),
            'priority' => 1,
        ]);

        $customize->addControl(new CustomizeControl('site_identity', [
            'label' => __('admin.customize.site_identity'),
            'section' => 'site_identity',
            'settings' => 'site_identity',
            'type' => 'site_identity',
        ]));

        $customize = app(CustomizeRegistry::class)->apply($customize);

        $homePageId = theme_setting('home_page');

        return [
            'title' => __('admin.customize.site_identity'),
            'panels' => $this->buildPanels($customize),
            'settings' => [
                'setting' => app(SettingContract::class)->all()->toArray(),
                'theme_setting' => app(ThemeSettingContract::class)->all()->toArray(),
            ],
            'pages' => $this->pagesPayload(),
            'pageTemplates' => $this->pageTemplatesPayload(),
            'availableBlocks' => $this->availableBlocksPayload(),
            'homePageBlocks' => $homePageId ? $this->pageBlocksPayload((string) $homePageId) : [],
            'previewUrl' => url('/'),
            'theme' => theme_name(),
        ];
    }

    /**
     * @return array{blocks: array<string, array<int, array<string, mixed>>>, template: string|null}
     */
    public function pageBlocks(string $pageId): array
    {
        $page = Page::query()->findOrFail($pageId);

        return [
            'blocks' => $this->pageBlocksPayload($page->id),
            'template' => $page->template,
        ];
    }

    /**
     * Widget definitions and assignments for the customizer's widget control.
     *
     * @return array{
     *     widgets: array<int, array<string, mixed>>,
     *     sidebars: array<int, array<string, mixed>>,
     *     sidebarWidgets: array<string, array<int, array<string, mixed>>>,
     *     locale: string,
     *     theme: string|null
     * }
     */
    public function widgets(): array
    {
        $payload = app(WidgetCatalog::class)->payload();

        return [
            'widgets' => $payload['widgets'],
            'sidebars' => $payload['sidebars'],
            'sidebarWidgets' => $payload['sidebar_widgets'],
            'locale' => $payload['locale'],
            'theme' => $payload['theme'],
        ];
    }

    /**
     * Nest sections and their controls under the registered panels.
     *
     * @return Collection<int, mixed>
     */
    protected function buildPanels(Customize $customize): Collection
    {
        $panels = $customize->getPanel()->sortBy('priority');

        foreach ($panels as $key => $panel) {
            $sections = $customize->getSection()->where('panel', $key);

            if ($sections->isEmpty()) {
                continue;
            }

            $childs = $panel->get('childs', new Collection([]));

            foreach ($sections as $secKey => $section) {
                $section->put('controls', $customize->getControl()->where('section', $secKey));
                $childs->put($secKey, $section);
            }

            $panel->put('childs', $childs);
        }

        foreach ($customize->getSection()->whereNull('panel') as $secKey => $section) {
            $section->put('controls', $customize->getControl()->where('section', $secKey));
            $panels->put($secKey, $section);
        }

        return $panels->values();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function pagesPayload(): array
    {
        return Page::query()
            ->with('translations')
            ->limit(500)
            ->get()
            ->map(fn (Page $page) => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'template' => $page->template,
            ])
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function pageTemplatesPayload(): array
    {
        return PageTemplate::all()
            ->map(fn ($template, $key) => [
                'key' => $key,
                'label' => $template->get('label'),
                'blocks' => $template->get('blocks') ?? [],
            ])
            ->values()
            ->toArray();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function availableBlocksPayload(): array
    {
        return PageBlock::all()
            ->map(fn ($block, $key) => [
                'key' => $key,
                'label' => $block->get('label'),
            ])
            ->values()
            ->toArray();
    }

    /**
     * @return array<string, array<int, array<string, mixed>>>
     */
    public function pageBlocksPayload(string $pageId): array
    {
        $page = Page::query()->find($pageId);

        if ($page === null) {
            return [];
        }

        $formatted = [];

        $page->blocks()
            ->with('translations')
            ->orderBy('display_order')
            ->get()
            ->each(function (PageBlockModel $block) use (&$formatted): void {
                $formatted[$block->container][] = [
                    'id' => $block->id,
                    'block' => $block->block,
                    'label' => $block->label,
                    'data' => $block->data ?? [],
                ];
            });

        return $formatted;
    }
}
