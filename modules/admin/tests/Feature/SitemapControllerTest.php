<?php

namespace Modules\Admin\Tests\Feature;

use App\Contracts\Sitemap as SitemapContract;
use App\Contracts\Sitemapable;
use App\Enums\PageStatus;
use App\Facades\Setting;
use App\Models\Pages\Page;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Admin\Tests\TestCase;
use Modules\Auth\Models\User;
use Modules\Blog\Models\Post;
use Spatie\Sitemap\Tags\Url;

class SitemapControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function makePage(string $slug, array $attributes = []): Page
    {
        $page = Page::create(array_merge([
            'status' => PageStatus::Published->value,
        ], $attributes));

        $page->translations()->create([
            'locale' => 'en',
            'title' => 'About',
            'slug' => $slug,
        ]);

        return $page;
    }

    public function test_sitemap_index_returns_xml(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $this->assertStringStartsWith('text/xml', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('<sitemapindex', $response->getContent());
    }

    public function test_sitemap_index_skips_unusable_providers(): void
    {
        app(SitemapContract::class)->register('faulty', 'NonExistentClass');

        $this->get('/sitemap.xml')
            ->assertOk()
            ->assertSee('<sitemapindex', false);
    }

    public function test_sitemap_index_lists_provider_sub_sitemaps(): void
    {
        Post::factory()->create();

        $content = $this->get('/sitemap.xml')->assertOk()->getContent();

        $this->assertStringContainsString('sitemap/posts/page-1.xml', $content);
        $this->assertStringContainsString('sitemap/home.xml', $content);
    }

    public function test_home_sitemap_lists_every_language_in_prefix_mode(): void
    {
        Setting::set('multiple_language', 'prefix');
        Setting::set('language', 'en');

        $response = $this->get('/sitemap/home.xml');

        $response->assertOk();
        $content = $response->getContent();

        $this->assertStringContainsString('<urlset', $content);
        $this->assertStringContainsString('/vi', $content);
    }

    public function test_home_sitemap_is_deduplicated_in_single_language_mode(): void
    {
        Setting::set('multiple_language', 'none');

        $content = $this->get('/sitemap/home.xml')->assertOk()->getContent();

        $this->assertSame(1, substr_count($content, '<url>'));
    }

    public function test_home_sitemap_rejects_unknown_pages(): void
    {
        $this->get('/sitemap/other.xml')->assertNotFound();
    }

    public function test_provider_sitemap_returns_urls(): void
    {
        $post = Post::factory()->create();
        $slug = $post->translations()->first()->slug;

        $response = $this->get('/sitemap/posts/page-1.xml');

        $response->assertOk();
        $content = $response->getContent();

        $this->assertStringContainsString('<urlset', $content);
        $this->assertStringContainsString("/posts/{$slug}", $content);
    }

    public function test_pages_provider_excludes_the_home_page(): void
    {
        $this->makePage('about-us');
        $this->makePage('home', ['status' => PageStatus::Published->value]);

        theme_setting()->set('home_page', Page::query()->whereHas(
            'translations',
            fn ($query) => $query->where('slug', 'home')
        )->value('id'));

        $content = $this->get('/sitemap/pages/page-1.xml')->assertOk()->getContent();

        $this->assertStringContainsString('/about-us', $content);
        $this->assertStringNotContainsString('/home', $content);
    }

    public function test_provider_sitemap_returns_404_for_unknown_provider(): void
    {
        $this->get('/sitemap/non-existent/page-1.xml')->assertNotFound();
    }

    public function test_provider_sitemap_returns_404_for_non_sitemapable_model(): void
    {
        app(SitemapContract::class)->register('users', User::class);

        $this->get('/sitemap/users/page-1.xml')->assertNotFound();
    }

    public function test_provider_sitemap_excludes_drafts(): void
    {
        Post::factory()->draft()->create();

        $content = $this->get('/sitemap/posts/page-1.xml')->assertOk()->getContent();

        $this->assertStringNotContainsString('/posts/', $content);
    }

    public function test_provider_sitemap_prefixes_non_default_language(): void
    {
        Setting::set('multiple_language', 'prefix');
        Setting::set('language', 'en');

        $post = Post::factory()->create();
        $post->translations()->create([
            'locale' => 'vi',
            'title' => 'Xin chao',
            'slug' => 'xin-chao',
            'content' => '<p>Noi dung</p>',
        ]);

        $content = $this->get('/sitemap/posts/page-1.xml')->assertOk()->getContent();

        $this->assertStringContainsString('/vi/posts/xin-chao', $content);
    }

    public function test_provider_sitemap_does_not_leak_internal_errors(): void
    {
        app(SitemapContract::class)->register('boom', ThrowingSitemapModel::class);

        $this->get('/sitemap/boom/page-1.xml')
            ->assertStatus(500)
            ->assertDontSee('SitemapDatabaseBoom');
    }
}

class ThrowingSitemapModel extends Model implements Sitemapable
{
    public static function forSitemap(): Builder
    {
        throw new \RuntimeException('SitemapDatabaseBoom');
    }

    public function scopeForSitemap(Builder $builder): Builder
    {
        throw new \RuntimeException('SitemapDatabaseBoom');
    }

    public function getUrl(): string
    {
        return '';
    }

    public function toSitemapTag(): Url|string|array
    {
        return Url::create('https://example.com');
    }
}
