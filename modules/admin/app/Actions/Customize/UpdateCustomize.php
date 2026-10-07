<?php

namespace Modules\Admin\Actions\Customize;

use App\Contracts\Setting as SettingContract;
use App\Contracts\ThemeSetting as ThemeSettingContract;
use App\Facades\PageBlock;
use App\Facades\Sidebar;
use App\Models\Pages\Page;
use Modules\Admin\Actions\Widget\UpdateSidebarWidgets;

/**
 * Persist a customizer submission: global/theme settings, the homepage block
 * tree and the sidebar widgets.
 */
class UpdateCustomize
{
    /**
     * @param  array<string, mixed>  $setting
     * @param  array<string, mixed>  $themeSetting
     * @param  array<string, mixed>|null  $blocks  Null leaves blocks untouched.
     * @param  array<string, mixed>|null  $widgets  Null leaves widgets untouched.
     */
    public function handle(
        array $setting,
        array $themeSetting,
        string $locale,
        ?array $blocks = null,
        ?array $widgets = null
    ): void {
        $settings = app(SettingContract::class);
        $settings->locale($locale);
        $settings->sets($setting);
        $settings->locale(app()->getLocale());

        app(ThemeSettingContract::class)->sets($themeSetting);

        $homePageId = $themeSetting['home_page'] ?? theme_setting('home_page');

        if ($homePageId && $blocks !== null) {
            $this->syncBlocks((string) $homePageId, $blocks, $locale);
        }

        if ($widgets !== null) {
            $this->syncWidgets($widgets, $locale);
        }
    }

    /**
     * @param  array<string, mixed>  $blocks
     */
    protected function syncBlocks(string $pageId, array $blocks, string $locale): void
    {
        $page = Page::query()->find($pageId);

        if ($page === null) {
            return;
        }

        $keptIds = [];

        foreach ($blocks as $containerKey => $container) {
            if (! is_array($container)) {
                continue;
            }

            $items = isset($container['block']) ? [$container] : $container;
            $order = 1;

            foreach ($items as $content) {
                if (! is_array($content) || empty($content['block'])) {
                    continue;
                }

                if (PageBlock::get($content['block']) === null) {
                    continue;
                }

                $attributes = [
                    'container' => $content['container'] ?? $containerKey,
                    'block' => $content['block'],
                    'data' => $content['data'] ?? [],
                    'display_order' => $order,
                ];

                $block = ! empty($content['id'])
                    ? $page->blocks()->whereKey($content['id'])->first()
                    : null;

                if ($block !== null) {
                    $block->fill($attributes)->save();
                } else {
                    $block = $page->blocks()->create($attributes);
                }

                $translation = $block->translateOrNew($locale);
                $translation->label = $content['label'] ?? null;
                $translation->fields = $content['data'] ?? [];
                $block->save();

                $keptIds[] = $block->id;
                $order++;
            }
        }

        $page->blocks()
            ->whereNotIn('id', $keptIds)
            ->get()
            ->each
            ->delete();
    }

    /**
     * @param  array<string, mixed>  $widgets
     */
    protected function syncWidgets(array $widgets, string $locale): void
    {
        foreach ($widgets as $sidebarKey => $contents) {
            if (! is_array($contents) || Sidebar::get($sidebarKey) === null) {
                continue;
            }

            app(UpdateSidebarWidgets::class)->handle($sidebarKey, $contents, $locale, theme_name());
        }
    }
}
