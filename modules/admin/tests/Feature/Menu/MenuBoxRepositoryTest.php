<?php

namespace Modules\Admin\Tests\Feature\Menu;

use App\Contracts\MenuBox as MenuBoxContract;
use Modules\Admin\Tests\TestCase;

class MenuBoxRepositoryTest extends TestCase
{
    protected function repository(): MenuBoxContract
    {
        return app(MenuBoxContract::class);
    }

    public function test_make_and_get(): void
    {
        $repository = $this->repository();
        $repository->make('genres', 'App\\Models\\Genre', fn () => ['priority' => 10]);

        $box = $repository->get('genres');

        $this->assertSame('App\\Models\\Genre', $box['class']);
        $this->assertSame(['priority' => 10], ($box['options'])());
    }

    public function test_get_returns_empty_array_for_unknown_position(): void
    {
        $this->assertSame([], $this->repository()->get('missing'));
    }

    public function test_all_sorts_boxes_by_priority(): void
    {
        $repository = $this->repository();
        $repository->make('genres', 'App\\Models\\Genre', fn () => ['priority' => 10]);
        $repository->make('countries', 'App\\Models\\Country', fn () => ['priority' => 5]);
        $repository->make('years', 'App\\Models\\Year', fn () => []);

        $priorities = $repository->all()
            ->map(fn (array $box) => $box['options']()['priority'] ?? 99)
            ->values()
            ->all();

        $sorted = $priorities;
        sort($sorted);

        $this->assertSame($sorted, $priorities);
    }
}
