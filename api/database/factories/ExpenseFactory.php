<?php

namespace Database\Factories;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Expense>
 */
class ExpenseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
         return [
            'title' => fake()->word(),
            'amount' => fake()->randomFloat(2, 1, 10000),
            // 'category_id'=> create from category factory, then create income using the id
            'date' => fake()->date('Y-m-d')
        ];
    }
}
