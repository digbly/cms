<?php

namespace App\Support;

use App\Contracts\PageBlock as PageBlockContract;
use App\Models\Pages\Page;
use App\Models\Pages\PageBlock as PageBlockModel;

class PageBlockRenderer
{
    public function __construct(protected PageBlockContract $blocks) {}

    /**
     * Resolve a page's blocks into a frontend payload grouped by container.
     *
     * @return array<string, array<int, array{key: string, label: string, component: string|null, data: array<string, mixed>, id: string}>>
     */
    public function payload(Page $page): array
    {
        $grouped = [];

        $page->blocks()
            ->with('translations')
            ->orderBy('display_order')
            ->get()
            ->each(function (PageBlockModel $block) use (&$grouped): void {
                $definition = $this->blocks->get($block->block);

                if ($definition === null || $definition->component === null) {
                    return;
                }

                $grouped[$block->container][] = [
                    'id' => $block->id,
                    ...$definition->resolve($block),
                ];
            });

        return $grouped;
    }
}
