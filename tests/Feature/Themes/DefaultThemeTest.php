<?php

namespace Tests\Feature\Themes;

use App\Facades\Setting;
use App\Models\Menus\Menu;
use App\Models\Pages\Page;
use App\Themes\FileRepository;
use App\Themes\ThemeManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Modules\Blog\Enums\CommentStatus;
use Modules\Blog\Enums\PostStatus;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\Comment;
use Modules\Blog\Models\Post;
use Tests\TestCase;
use Themes\Default\Providers\ThemeServiceProvider;

class DefaultThemeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->app->register(ThemeServiceProvider::class);

        $theme = $this->app->make(FileRepository::class)->findOrFail('Default');

        $this->app->make(ThemeManager::class)->activate($theme);
    }

    protected function makePost(array $translation = [], array $attributes = []): Post
    {
        $post = Post::factory()->create($attributes);

        $post->translations()->updateOrCreate(
            ['locale' => 'en'],
            array_merge([
                'locale' => 'en',
                'title' => 'Default title',
                'slug' => 'default-'.uniqid(),
                'content' => '<p>Default content</p>',
            ], $translation)
        );

        return $post;
    }

    protected function makeCategory(array $translation = []): Category
    {
        $category = Category::factory()->create();

        $category->translations()->updateOrCreate(
            ['locale' => 'en'],
            array_merge([
                'locale' => 'en',
                'name' => 'Default',
                'slug' => 'default-'.uniqid(),
            ], $translation)
        );

        return $category;
    }

    public function test_home_lists_published_posts_with_pagination(): void
    {
        $base = now();

        foreach (range(1, 10) as $index) {
            $number = str_pad((string) $index, 2, '0', STR_PAD_LEFT);
            $this->makePost(
                ['title' => "Article {$number}", 'slug' => "article-{$number}"],
                ['created_at' => $base->copy()->subSeconds($index), 'updated_at' => $base->copy()->subSeconds($index)],
            );
        }

        $this->makePost(
            ['title' => 'Hidden draft', 'slug' => 'hidden-draft'],
            ['status' => PostStatus::Draft],
        );

        $pageOne = $this->get('/')->assertOk();
        $pageOne->assertSee('Article 01')
            ->assertDontSee('Hidden draft')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home', false)
                ->has('posts.data', 9)
                ->where('posts.total', 10)
                ->where('posts.current_page', 1));

        $pageTwo = $this->get('/?page=2')->assertOk();
        $pageTwo->assertSee('Article 10')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home', false)
                ->has('posts.data', 1)
                ->where('posts.current_page', 2));
    }

    public function test_post_page_shows_content_and_only_approved_comments(): void
    {
        $post = $this->makePost(['title' => 'Read me', 'slug' => 'read-me', 'content' => '<p>Body copy</p>']);

        Comment::factory()->create([
            'post_id' => $post->getKey(),
            'content' => 'Approved comment',
            'status' => CommentStatus::Approved,
        ]);

        Comment::factory()->create([
            'post_id' => $post->getKey(),
            'content' => 'Pending comment',
            'status' => CommentStatus::Pending,
        ]);

        $this->get('/posts/read-me')
            ->assertOk()
            ->assertSee('Read me')
            ->assertSee('Body copy', false)
            ->assertSee('Approved comment')
            ->assertDontSee('Pending comment')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Post', false)
                ->where('post.title', 'Read me')
                ->has('comments.data', 1)
                ->where('comments.total', 1)
                ->where('comments.data.0.content', 'Approved comment'));
    }

    public function test_category_page_lists_its_posts(): void
    {
        $category = $this->makeCategory(['name' => 'News', 'slug' => 'news']);

        $inCategory = $this->makePost(['title' => 'In category', 'slug' => 'in-category']);
        $inCategory->categories()->sync([$category->getKey()]);

        $this->get('/categories/news')
            ->assertOk()
            ->assertSee('News')
            ->assertSee('In category')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Category', false)
                ->where('category.name', 'News')
                ->has('posts.data', 1));
    }

    public function test_category_page_ignores_drafts(): void
    {
        $category = $this->makeCategory(['name' => 'News', 'slug' => 'news']);

        $draft = $this->makePost(
            ['title' => 'Draft in category', 'slug' => 'draft-in-category'],
            ['status' => PostStatus::Draft],
        );
        $draft->categories()->sync([$category->getKey()]);

        $this->get('/categories/news')
            ->assertOk()
            ->assertDontSee('Draft in category')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Category', false)
                ->has('posts.data', 0));
    }

    public function test_search_filters_posts_by_title(): void
    {
        $this->makePost(['title' => 'Tailwind tricks', 'slug' => 'tailwind-tricks']);
        $this->makePost(['title' => 'Blade basics', 'slug' => 'blade-basics']);

        $this->get('/search?q=Tailwind')
            ->assertOk()
            ->assertSee('Tailwind tricks')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Search', false)
                ->where('search', 'Tailwind')
                ->has('posts.data', 1));

        $this->get('/search?q=zzz-no-match')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Search', false)
                ->has('posts.data', 0));
    }

    public function test_guest_can_submit_a_comment(): void
    {
        $post = $this->makePost(['title' => 'Comment here', 'slug' => 'comment-here']);

        $this->post("/posts/{$post->getKey()}/comments", [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'content' => 'Nice article!',
        ])->assertRedirect(route('default.posts.show', 'comment-here'));

        $this->assertDatabaseHas('comments', [
            'post_id' => $post->getKey(),
            'name' => 'Jane Doe',
            'content' => 'Nice article!',
            'status' => CommentStatus::Pending->value,
        ]);
    }

    public function test_comment_requires_valid_input(): void
    {
        $post = $this->makePost(['title' => 'Validated', 'slug' => 'validated']);

        $this->post("/posts/{$post->getKey()}/comments", [
            'name' => '',
            'email' => 'not-an-email',
            'content' => '',
        ])->assertSessionHasErrors(['name', 'email', 'content']);

        $this->assertDatabaseCount('comments', 0);
    }

    public function test_active_theme_does_not_shadow_the_application_root_view(): void
    {
        // The theme prepends its views for error pages; the theme's Inertia root
        // must use a namespaced, non-colliding name so view('app') (used by the
        // admin Inertia root) still resolves to the application view.
        $this->assertSame(
            resource_path('views/app.blade.php'),
            view()->getFinder()->find('app')
        );

        $this->assertSame(
            theme_path('Default', 'resources/views/theme.blade.php'),
            view()->getFinder()->find('default::theme')
        );
    }

    public function test_unknown_post_uses_themed_404(): void
    {
        $this->get('/posts/does-not-exist')
            ->assertNotFound()
            ->assertSee('Back to home')
            ->assertSee('"component":"NotFound"', false);
    }

    public function test_header_renders_brand_and_primary_menu(): void
    {
        Setting::set('sitename', 'My Site');

        $menu = Menu::create(['name' => 'Main']);

        $home = $menu->items()->create([
            'box_key' => 'custom',
            'link' => '/',
            'is_home' => true,
            'display_order' => 0,
        ]);
        $home->translations()->create(['locale' => 'en', 'label' => 'Home']);

        $about = $menu->items()->create([
            'box_key' => 'custom',
            'link' => '/about',
            'display_order' => 1,
        ]);
        $about->translations()->create(['locale' => 'en', 'label' => 'About']);

        $team = $menu->items()->create([
            'parent_id' => $about->id,
            'box_key' => 'custom',
            'link' => '/about/team',
            'display_order' => 0,
        ]);
        $team->translations()->create(['locale' => 'en', 'label' => 'Team']);

        Setting::set('nav_location', ['primary' => $menu->id]);

        $this->get('/')
            ->assertOk()
            ->assertSee('My Site')
            ->assertInertia(fn (Assert $page) => $page
                ->component('Home', false)
                ->where('siteName', 'My Site')
                ->where('siteLogo', null)
                ->where('navMenu.0.label', 'Home')
                ->where('navMenu.1.label', 'About')
                ->where('navMenu.1.children.0.label', 'Team')
                ->where('navMenu.1.children.0.url', '/about/team'));
    }

    public function test_home_page_renders_configured_blocks(): void
    {
        $page = Page::create([
            'status' => 'published',
            'template' => 'landing',
        ]);

        $page->translateOrNew('en')->title = 'Home';
        $page->translateOrNew('en')->slug = 'home';
        $page->save();

        $hero = $page->blocks()->create([
            'block' => 'hero',
            'container' => 'content',
            'display_order' => 1,
            'data' => ['title' => 'Welcome aboard'],
        ]);
        $hero->translateOrNew('en')->label = 'Hero';
        $hero->save();

        $posts = $page->blocks()->create([
            'block' => 'posts',
            'container' => 'content',
            'display_order' => 2,
            'data' => ['title' => 'Latest', 'limit' => 3],
        ]);
        $posts->translateOrNew('en')->label = 'Latest';
        $posts->save();

        $this->makePost(['title' => 'Block article', 'slug' => 'block-article']);

        theme_setting()->set('home_page', $page->id);

        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $inertia) => $inertia
                ->component('Home', false)
                ->where('template.key', 'landing')
                ->has('blocks.content', 2)
                ->where('blocks.content.0.key', 'hero')
                ->where('blocks.content.0.component', 'Blocks/Hero')
                ->where('blocks.content.0.data.title', 'Welcome aboard')
                ->where('blocks.content.1.key', 'posts')
                ->where('blocks.content.1.component', 'Blocks/Posts')
                ->has('blocks.content.1.data.posts', 1)
                ->where('blocks.content.1.data.posts.0.title', 'Block article'));
    }
}
