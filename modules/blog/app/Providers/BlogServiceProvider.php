<?php

namespace Modules\Blog\Providers;

use App\Facades\AdminTranslation;
use App\Facades\Menu;
use App\Facades\MenuBox;
use App\Support\MenuRepository;
use Modules\Blog\Enums\Permission;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\Post;
use Nwidart\Modules\Support\ModuleServiceProvider;

class BlogServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'Blog';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'blog';

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
        RouteServiceProvider::class,
    ];

    /**
     * Bootstrap module services.
     */
    public function boot(): void
    {
        parent::boot();

        $this->registerNavigation();
        $this->registerMenuBoxes();
        $this->registerAdminTranslations();
    }

    /**
     * Register the admin SPA translation namespace owned by this module.
     */
    protected function registerAdminTranslations(): void
    {
        AdminTranslation::make($this->nameLower, fn (): array => [
            'group' => 'blog',
            'path' => module_path($this->name, 'resources/lang'),
        ]);
    }

    /**
     * Register the admin SPA sidebar items owned by this module.
     */
    protected function registerNavigation(): void
    {
        $position = MenuRepository::POSITION_ADMIN;

        Menu::make('blog', fn () => [
            'label' => __('blog.nav.blog'),
            'icon' => 'book-open',
            'position' => $position,
            'priority' => 30,
        ]);

        Menu::make('blog-posts', fn () => [
            'label' => __('blog.nav.blogPosts'),
            'to' => '/blog/posts',
            'icon' => 'newspaper',
            'permission' => Permission::PostsView->value,
            'parent' => 'blog',
            'position' => $position,
            'priority' => 10,
        ]);

        Menu::make('blog-categories', fn () => [
            'label' => __('blog.nav.blogCategories'),
            'to' => '/blog/categories',
            'icon' => 'folder-tree',
            'permission' => Permission::CategoriesView->value,
            'parent' => 'blog',
            'position' => $position,
            'priority' => 20,
        ]);

        Menu::make('blog-comments', fn () => [
            'label' => __('blog.nav.blogComments'),
            'to' => '/blog/comments',
            'icon' => 'message-square',
            'permission' => Permission::CommentsView->value,
            'parent' => 'blog',
            'position' => $position,
            'priority' => 30,
        ]);
    }

    /**
     * Register the content sources the menu builder can pull items from.
     */
    protected function registerMenuBoxes(): void
    {
        MenuBox::make('posts', Post::class, fn () => [
            'label' => __('blog.nav.blogPosts'),
            'icon' => 'newspaper',
            'field' => 'title',
            'priority' => 10,
        ]);

        MenuBox::make('post-categories', Category::class, fn () => [
            'label' => __('blog.nav.blogCategories'),
            'icon' => 'folder-tree',
            'field' => 'name',
            'priority' => 20,
        ]);
    }
}
