<?php

namespace Modules\Admin\Tests\Feature\Widget;

use App\Models\ThemeSidebar;
use App\Themes\FileRepository;
use App\Themes\ThemeManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Admin\Tests\TestCase;
use Modules\Blog\Models\Post;
use Themes\Default\Providers\ThemeServiceProvider;

class DefaultWidgetRenderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->app->register(ThemeServiceProvider::class);
        $this->app->make(ThemeManager::class)->activate(
            $this->app->make(FileRepository::class)->findOrFail('Default')
        );
    }

    protected function makePost(string $title, string $slug): Post
    {
        $post = Post::factory()->create();

        $post->translations()->updateOrCreate(
            ['locale' => 'en'],
            ['locale' => 'en', 'title' => $title, 'slug' => $slug, 'content' => '<p>Body</p>']
        );

        return $post;
    }

    protected function configureWidget(string $label, array $data = []): ThemeSidebar
    {
        $item = ThemeSidebar::create([
            'sidebar' => 'sidebar',
            'widget' => 'recent-posts',
            'data' => $data,
            'theme' => 'default',
            'display_order' => 1,
        ]);

        $item->translations()->create(['locale' => 'en', 'label' => $label]);

        return $item;
    }

    public function test_configured_widgets_render_in_the_sidebar(): void
    {
        $this->configureWidget('Fresh news');

        $this->makePost('Older article', 'older-article');
        $this->makePost('Newest article', 'newest-article');

        $this->get('/')
            ->assertOk()
            ->assertSee('Fresh news')
            ->assertSee('Newest article')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home', false)
                ->has('sidebarWidgets', 1)
                ->where('sidebarWidgets.0.label', 'Fresh news')
                ->has('sidebarWidgets.0.data.posts', 2));
    }

    public function test_widgets_fall_back_to_defaults_when_none_configured(): void
    {
        $this->makePost('Default article', 'default-article');

        $this->get('/')
            ->assertOk()
            ->assertSee('Categories')
            ->assertSee('Recent posts')
            ->assertSee('Popular posts')
            ->assertSee('Default article')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home', false)
                ->has('sidebarWidgets', 3));
    }
}
