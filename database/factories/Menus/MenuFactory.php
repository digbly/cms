<?php

namespace Database\Factories\Menus;

use App\Models\Menus\Menu;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Menu>
 */
class MenuFactory extends Factory
{
    protected $model = Menu::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
        ];
    }
}
