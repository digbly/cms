<?php

namespace Modules\Blog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Blog\Enums\CommentStatus;
use Modules\Blog\Models\Comment;
use Modules\Blog\Models\Post;

class CommentFactory extends Factory
{
    protected $model = Comment::class;

    public function definition(): array
    {
        return [
            'post_id' => Post::factory(),
            'parent_id' => null,
            'user_id' => null,
            'name' => $this->faker->name(),
            'email' => $this->faker->safeEmail(),
            'content' => $this->faker->paragraph(),
            'status' => CommentStatus::Approved,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (): array => ['status' => CommentStatus::Pending]);
    }
}
