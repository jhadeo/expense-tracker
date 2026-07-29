<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // expenses
            ['name' => 'Food', 'type' => CategoryType::Expenses],
            ['name' => 'Transportation', 'type' => CategoryType::Expenses],
            ['name' => 'Leisure', 'type' => CategoryType::Expenses],
            // income
            ['name' => 'Salary', 'type' => CategoryType::Income],
            ['name' => 'Bonus', 'type' => CategoryType::Income],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name'], 'type' => $category['type']],
                $category
            );
        }
    }
}
