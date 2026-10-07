<?php

namespace Modules\Admin\Tests\Feature\Menu;

use App\Contracts\NavMenu as NavMenuContract;
use Modules\Admin\Tests\TestCase;

class NavMenuRepositoryTest extends TestCase
{
    protected function repository(): NavMenuContract
    {
        return app(NavMenuContract::class);
    }

    public function test_make_and_get(): void
    {
        $repository = $this->repository();
        $repository->make('main', fn () => ['label' => 'Main']);

        $this->assertSame(['label' => 'Main'], $repository->get('main'));
    }

    public function test_get_returns_null_for_unknown_key(): void
    {
        $this->assertNull($this->repository()->get('missing'));
    }

    public function test_all_returns_every_nav_menu_keyed_by_key(): void
    {
        $repository = $this->repository();
        $repository->make('main', fn () => ['label' => 'Main']);
        $repository->make('footer', fn () => ['label' => 'Footer']);

        $all = $repository->all();

        $this->assertSame('Main', $all->get('main')['label']);
        $this->assertSame('Footer', $all->get('footer')['label']);
    }
}
