<?php

namespace Modules\Blog\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Blog\Models\Category;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'parent_id' => null,
            'is_home' => false,
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Category $category): void {
            if ($category->translations()->exists()) {
                return;
            }

            $name = $this->faker->unique()->words(2, true);

            $category->translations()->create([
                'locale' => 'en',
                'name' => Str::title($name),
                'slug' => Str::slug($name).'-'.Str::lower(Str::random(6)),
                'description' => $this->faker->sentence(),
            ]);
        });
    }
}
