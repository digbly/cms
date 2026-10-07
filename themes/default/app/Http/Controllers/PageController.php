<?php

namespace Themes\Default\Http\Controllers;

use App\Enums\PageStatus;
use App\Facades\PageTemplate;
use App\Models\Pages\Page;
use App\Support\PageBlockRenderer;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Response;

class PageController extends Controller
{
    public function show(string $slug): Response
    {
        $page = Page::query()
            ->where('status', PageStatus::Published)
            ->whereHas('translations', fn (Builder $query) => $query->where('slug', $slug))
            ->firstOrFail();

        $translation = $page->translate(app()->getLocale()) ?? $page->translations()->first();

        $template = $page->template !== null ? PageTemplate::get($page->template) : null;
        $blocks = $template !== null ? app(PageBlockRenderer::class)->payload($page) : [];

        return $this->render('Page', [
            'heading' => $translation?->title,
            'content' => $translation?->content,
            'template' => $template !== null ? [
                'key' => $template->key,
                'label' => $template->get('label'),
                'blocks' => $template->get('blocks') ?? [],
            ] : null,
            'blocks' => $blocks,
        ]);
    }
}
