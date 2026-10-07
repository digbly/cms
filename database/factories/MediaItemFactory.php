<?php

namespace Database\Factories;

use App\Models\MediaItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaItemFactory extends Factory
{
    protected $model = MediaItem::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->words(2, true),
            'alt' => $this->faker->sentence(),
            'caption' => null,
            'description' => null,
            'uploaded_by' => null,
        ];
    }
}
