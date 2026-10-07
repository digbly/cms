<?php

namespace Modules\Admin\Tests\Feature\Menu;

use App\Support\MenuRepository;
use Modules\Admin\Tests\TestCase;

class MenuTreeTest extends TestCase
{
    public function test_tree_builds_nested_items_sorted_by_priority(): void
    {
        $repository = new MenuRepository;
        $repository->make('blog', fn () => ['label' => 'Blog', 'position' => 'admin', 'priority' => 20]);
        $repository->make('posts', fn () => [
            'label' => 'Posts',
            'to' => '/blog/posts',
            'parent' => 'blog',
            'position' => 'admin',
            'priority' => 20,
        ]);
        $repository->make('categories', fn () => [
            'label' => 'Categories',
            'to' => '/blog/categories',
            'parent' => 'blog',
            'position' => 'admin',
            'priority' => 10,
        ]);

        $tree = $repository->tree('admin');

        $this->assertSame(['blog'], $tree->pluck('key')->all());
        $this->assertSame(
            ['categories', 'posts'],
            $tree->first()['children']->pluck('key')->all()
        );
    }

    public function test_tree_filters_by_position_and_promotes_orphans_to_roots(): void
    {
        $repository = new MenuRepository;
        $repository->make('dashboard', fn () => ['label' => 'Dashboard', 'to' => '/dashboard']);
        $repository->make('orphan', fn () => [
            'label' => 'Orphan',
            'to' => '/orphan',
            'parent' => 'missing',
        ]);

        $tree = $repository->tree('admin-left');

        $this->assertSame(
            ['dashboard', 'orphan'],
            $tree->pluck('key')->sort()->values()->all()
        );
    }

    public function test_tree_applies_defaults(): void
    {
        $repository = new MenuRepository;
        $repository->make('media', fn () => ['label' => 'Media', 'position' => 'admin']);

        $item = $repository->tree('admin')->first();

        $this->assertSame('media', $item['key']);
        $this->assertSame('Media', $item['label']);
        $this->assertNull($item['to']);
        $this->assertSame('circle', $item['icon']);
        $this->assertNull($item['permission']);
        $this->assertNull($item['parent']);
        $this->assertSame(20, $item['priority']);
        $this->assertTrue($item['children']->isEmpty());
    }
}
