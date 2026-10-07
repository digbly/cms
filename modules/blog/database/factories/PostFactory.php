<?php

namespace Modules\Blog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Blog\Enums\PostStatus;
use Modules\Blog\Models\Post;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'status' => PostStatus::Published,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Post $post): void {
            if ($post->translations()->exists()) {
                return;
            }

            $title = $this->faker->sentence(4);

            $post->translations()->create([
                'locale' => 'en',
                'title' => $title,
                'slug' => Str::slug($title).'-'.Str::lower(Str::random(6)),
                'description' => $this->faker->sentence(),
                'content' => $this->faker->paragraphs(3, true),
            ]);
        });
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => PostStatus::Draft]);
    }
}
