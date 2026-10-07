<?php

namespace Modules\Admin\Tests\Feature\Menu;

use App\Contracts\Menu as MenuContract;
use Modules\Admin\Tests\TestCase;

class MenuRepositoryTest extends TestCase
{
    protected function repository(): MenuContract
    {
        return app(MenuContract::class);
    }

    public function test_make_and_get(): void
    {
        $repository = $this->repository();
        $repository->make('dashboard', fn () => ['title' => 'Dashboard']);

        $this->assertSame(['title' => 'Dashboard'], $repository->get('dashboard'));
    }

    public function test_get_returns_null_for_unknown_key(): void
    {
        $this->assertNull($this->repository()->get('missing'));
    }

    public function test_all_returns_every_menu_keyed_by_key(): void
    {
        $repository = $this->repository();
        $repository->make('dashboard', fn () => ['title' => 'Dashboard']);
        $repository->make('settings', fn () => ['title' => 'Settings']);

        $all = $repository->all();

        $this->assertSame('Dashboard', $all->get('dashboard')['title']);
        $this->assertSame('Settings', $all->get('settings')['title']);
    }

    public function test_get_by_position_filters_and_applies_defaults(): void
    {
        $repository = $this->repository();
        $repository->make('dashboard', fn () => ['title' => 'Dashboard', 'position' => 'admin-left']);
        $repository->make('media', fn () => ['title' => 'Media']);
        $repository->make('settings', fn () => ['title' => 'Settings', 'position' => 'admin-right']);

        $left = $repository->getByPosition('admin-left');

        $this->assertSame(['dashboard', 'media'], $left->pluck('key')->all());

        $dashboard = $left->firstWhere('key', 'dashboard');
        $this->assertSame(url('admin'), $dashboard['url']);
        $this->assertSame('_self', $dashboard['target']);
        $this->assertSame('fa fa-circle', $dashboard['icon']);
        $this->assertSame(20, $dashboard['priority']);
        $this->assertNull($dashboard['parent']);

        $media = $left->firstWhere('key', 'media');
        $this->assertNull($media['position']);
    }

    public function test_get_by_position_builds_urls(): void
    {
        $repository = $this->repository();
        $repository->make('media', fn () => ['title' => 'Media']);
        $repository->make('custom', fn () => ['title' => 'Custom', 'url' => 'foo/bar']);
        $repository->make('prefixed', fn () => ['title' => 'Prefixed', 'prefix' => 'manage', 'url' => 'items']);

        $byKey = $repository->getByPosition('admin-left')->keyBy('key');

        $this->assertSame(url('admin/media'), $byKey['media']['url']);
        $this->assertSame(url('admin/foo/bar'), $byKey['custom']['url']);
        $this->assertSame(url('manage/items'), $byKey['prefixed']['url']);
    }
}
