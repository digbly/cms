<?php

namespace Themes\Default\Providers;

use App\Facades\Customize;
use App\Facades\PageBlock;
use App\Facades\PageTemplate;
use App\Facades\Sidebar;
use App\Facades\ThemeSetting;
use App\Facades\Widget;
use App\Models\Pages\PageBlock as PageBlockModel;
use App\Models\ThemeSidebar;
use App\Support\Customizes\Customize as CustomizeBuilder;
use App\Support\Customizes\CustomizeControl;
use Illuminate\Support\Collection;
use Illuminate\Support\ServiceProvider;
use Modules\Blog\Models\Post;
use Themes\Default\Support\PostPresenter;
use Themes\Default\Support\SidebarData;

class ThemeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerErrorViews();
        $this->registerSidebars();
        $this->registerWidgets();
        $this->registerPageTemplates();
        $this->registerPageBlocks();
        $this->registerThemeSettings();
        $this->registerCustomizePanels();
    }

    /**
     * Register the theme sidebars widgets can be assigned to.
     */
    protected function registerSidebars(): void
    {
        Sidebar::make('sidebar', fn () => [
            'label' => __('default::messages.sidebar_main'),
            'description' => __('default::messages.sidebar_main_description'),
        ]);
    }

    /**
     * Register the widgets shipped with the theme. Each widget exposes a
     * frontend component plus a resolver that the Inertia frontend uses to
     * render it client-side.
     */
    protected function registerWidgets(): void
    {
        Widget::make('categories', fn () => [
            'label' => __('default::messages.widget_categories'),
            'description' => __('default::messages.widget_categories_description'),
            'component' => 'Widgets/Categories',
            'only' => ['sidebar'],
            'data' => fn (): array => [
                'categories' => app(SidebarData::class)
                    ->categories()
                    ->map(fn ($category) => PostPresenter::category($category))
                    ->values()
                    ->all(),
            ],
        ]);

        Widget::make('recent-posts', fn () => [
            'label' => __('default::messages.widget_recent_posts'),
            'description' => __('default::messages.widget_recent_posts_description'),
            'component' => 'Widgets/RecentPosts',
            'only' => ['sidebar'],
            'defaults' => ['limit' => 5],
            'data' => fn (ThemeSidebar $sidebar, array $data): array => [
                'posts' => $this->presentPosts(
                    app(SidebarData::class)->recent((int) ($data['limit'] ?? 5))
                ),
            ],
        ]);

        Widget::make('popular-posts', fn () => [
            'label' => __('default::messages.widget_popular_posts'),
            'description' => __('default::messages.widget_popular_posts_description'),
            'component' => 'Widgets/PopularPosts',
            'only' => ['sidebar'],
            'defaults' => ['limit' => 5],
            'data' => fn (ThemeSidebar $sidebar, array $data): array => [
                'posts' => $this->presentPosts(
                    app(SidebarData::class)->popular((int) ($data['limit'] ?? 5))
                ),
            ],
        ]);
    }

    /**
     * Register the page templates the homepage builder can assign to a page,
     * mapping each template to the containers its blocks are placed in.
     */
    protected function registerPageTemplates(): void
    {
        PageTemplate::make('landing', fn () => [
            'label' => __('default::messages.page_template_landing'),
            'blocks' => [
                'content' => __('default::messages.page_container_content'),
            ],
        ]);
    }

    /**
     * Register the blocks available to the page templates of this theme, with
     * the frontend component and data resolver used to render each block.
     */
    protected function registerPageBlocks(): void
    {
        PageBlock::make('hero', fn () => [
            'label' => __('default::messages.page_block_hero'),
            'component' => 'Blocks/Hero',
        ]);

        PageBlock::make('posts', fn () => [
            'label' => __('default::messages.page_block_posts'),
            'component' => 'Blocks/Posts',
            'data' => fn (PageBlockModel $block, array $data): array => [
                'posts' => $this->presentPosts($this->postsForBlock($data)),
            ],
        ]);
    }

    /**
     * @param  Collection<int, Post>  $posts
     * @return array<int, array<string, mixed>>
     */
    protected function presentPosts(Collection $posts): array
    {
        return $posts
            ->map(fn (Post $post) => PostPresenter::post($post))
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return Collection<int, Post>
     */
    protected function postsForBlock(array $data): Collection
    {
        $limit = (int) ($data['limit'] ?? 6);

        return Post::query()
            ->published()
            ->with(['translations', 'categories.translations', 'author'])
            ->latest()
            ->limit(max(1, $limit))
            ->get();
    }

    /**
     * Register the theme settings the customizer exposes.
     */
    protected function registerThemeSettings(): void
    {
        ThemeSetting::make('home_page')
            ->type('string')
            ->default(null)
            ->add();
    }

    /**
     * Register the customizer panels owned by this theme. The homepage control
     * pairs the theme setting with the page templates registered above; the
     * widgets control exposes the theme sidebars.
     */
    protected function registerCustomizePanels(): void
    {
        Customize::register(function (CustomizeBuilder $customize): void {
            $customize->addSection('home_page_settings', [
                'title' => __('admin.customize.home_page'),
                'priority' => 1,
            ]);

            $customize->addControl(new CustomizeControl('home_page', [
                'label' => __('admin.customize.home_page'),
                'section' => 'home_page_settings',
                'settings' => 'home_page',
                'type' => 'homepage',
                'is_theme' => true,
            ]));

            $customize->addSection('widgets', [
                'title' => __('admin.customize.widgets_title'),
                'priority' => 3,
            ]);

            $customize->addControl(new CustomizeControl('widgets', [
                'label' => __('admin.customize.widgets_title'),
                'section' => 'widgets',
                'settings' => 'widgets',
                'type' => 'widgets',
                'is_theme' => true,
            ]));
        });
    }

    /**
     * Laravel resolves error views from the "errors" namespace, which is built
     * from config('view.paths'). Prepend the theme views so the themed error
     * pages (e.g. errors/404.blade.php) are used.
     */
    protected function registerErrorViews(): void
    {
        $views = theme()?->getViewsPath() ?? theme_path('Default', 'resources/views');

        config([
            'view.paths' => array_values(array_unique(
                array_merge([$views], (array) config('view.paths', []))
            )),
        ]);
    }
}
