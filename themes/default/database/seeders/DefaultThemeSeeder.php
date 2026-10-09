<?php

namespace Themes\Default\Database\Seeders;

use App\Enums\PageStatus;
use App\Facades\Setting;
use App\Models\Menus\Menu;
use App\Models\Pages\Page;
use App\Models\ThemeSidebar;
use Database\Seeders\BlogDemoSeeder;
use Illuminate\Database\Seeder;

class DefaultThemeSeeder extends Seeder
{
    /**
     * Seed the demo content the default theme needs to be previewed: site
     * settings, a primary menu, the home page with landing blocks, static
     * pages and the sidebar widgets.
     */
    public function run(): void
    {
        $this->seedSettings();
        $this->seedMenu();
        $this->seedHomePage();
        $this->seedPages();
        $this->seedSidebar();

        $this->call(BlogDemoSeeder::class);
    }

    protected function seedSettings(): void
    {
        Setting::set('sitename', 'Digbly');
        Setting::set('multiple_language', 'none');
        Setting::set('language', 'en');

        Setting::locale('vi')->set('title', 'Digbly');
        Setting::locale('vi')->set('description', 'Nền tảng blog hiện đại dành cho việc xuất bản nội dung.');
        Setting::locale('en')->set('title', 'Digbly');
        Setting::locale('en')->set('description', 'A modern blog platform built for publishing.');
    }

    protected function seedMenu(): void
    {
        $menu = Menu::query()->firstOrCreate(['name' => 'Main Menu']);

        if (! $menu->items()->exists()) {
            $items = [
                ['label' => 'Home', 'link' => '/', 'is_home' => true],
                ['label' => 'About', 'link' => '/about', 'is_home' => false],
                ['label' => 'Contact', 'link' => '/contact', 'is_home' => false],
            ];

            foreach ($items as $order => $attributes) {
                $item = $menu->items()->create([
                    'box_key' => 'custom',
                    'link' => $attributes['link'],
                    'target' => '_self',
                    'is_home' => $attributes['is_home'],
                    'display_order' => $order,
                ]);

                $item->translations()->create([
                    'locale' => 'en',
                    'label' => $attributes['label'],
                ]);
            }
        }

        Setting::set('nav_location', ['primary' => $menu->getKey()]);
    }

    protected function seedHomePage(): void
    {
        $page = $this->pageBySlug('home');

        if ($page === null) {
            $page = Page::query()->create([
                'status' => PageStatus::Published,
                'template' => 'landing',
            ]);

            $page->translations()->create([
                'locale' => 'en',
                'title' => 'Home',
                'slug' => 'home',
                'content' => null,
                'description' => 'Welcome to our blog.',
            ]);
        }

        $this->seedHomeBlocks($page);

        theme_setting()->set('home_page', $page->getKey());
    }

    protected function seedHomeBlocks(Page $page): void
    {
        $blocks = [
            [
                'block' => 'hero',
                'display_order' => 1,
                'label' => 'Hero',
                'data' => [
                    'title' => 'Build your next content platform',
                    'description' => 'A themeable, translatable CMS with a first-class writing experience.',
                ],
            ],
            [
                'block' => 'posts',
                'display_order' => 2,
                'label' => 'Latest posts',
                'data' => [
                    'title' => 'Latest posts',
                    'limit' => 6,
                ],
            ],
        ];

        foreach ($blocks as $attributes) {
            $block = $page->blocks()->firstOrCreate(
                ['block' => $attributes['block']],
                [
                    'theme' => theme_name(),
                    'container' => 'content',
                    'display_order' => $attributes['display_order'],
                    'data' => $attributes['data'],
                ]
            );

            $block->translations()->firstOrCreate(
                ['locale' => 'en'],
                ['label' => $attributes['label']]
            );
        }
    }

    protected function seedPages(): void
    {
        $pages = [
            ['title' => 'About', 'slug' => 'about', 'description' => 'About our company.'],
            ['title' => 'Contact', 'slug' => 'contact', 'description' => 'Get in touch with us.'],
        ];

        foreach ($pages as $attributes) {
            if ($this->pageBySlug($attributes['slug']) !== null) {
                continue;
            }

            $page = Page::query()->create([
                'status' => PageStatus::Published,
            ]);

            $page->translations()->create([
                'locale' => 'en',
                'title' => $attributes['title'],
                'slug' => $attributes['slug'],
                'description' => $attributes['description'],
                'content' => $this->pageContent($attributes['title']),
            ]);
        }
    }

    protected function pageBySlug(string $slug): ?Page
    {
        return Page::query()
            ->whereHas('translations', fn ($query) => $query->where('slug', $slug))
            ->first();
    }

    protected function seedSidebar(): void
    {
        $widgets = [
            ['widget' => 'categories', 'label' => 'Categories', 'data' => null],
            ['widget' => 'recent-posts', 'label' => 'Recent Posts', 'data' => ['limit' => 5]],
            ['widget' => 'popular-posts', 'label' => 'Popular Posts', 'data' => ['limit' => 5]],
        ];

        foreach ($widgets as $order => $attributes) {
            $sidebar = ThemeSidebar::query()->firstOrCreate(
                ['sidebar' => 'sidebar', 'widget' => $attributes['widget']],
                [
                    'theme' => theme_name(),
                    'display_order' => $order + 1,
                    'data' => $attributes['data'],
                ]
            );

            $sidebar->translations()->firstOrCreate(
                ['locale' => 'en'],
                ['label' => $attributes['label']]
            );
        }
    }

    protected function pageContent(string $title): string
    {
        return implode("\n", [
            '<p>Welcome to the '.$title.' page.</p>',
            '<p>This is sample content seeded for the default theme. Replace it with your own copy from the admin panel.</p>',
        ]);
    }
}
