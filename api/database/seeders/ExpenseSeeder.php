<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::query()->get(['id']);

        if ($users->isEmpty()) {
            return;
        }

        $expenseCategoryIds = Category::query()
            ->where('type', CategoryType::Expenses)
            ->pluck('id');

        if ($expenseCategoryIds->isEmpty()) {
            return;
        }

        foreach ($users as $user) {
            $expensesToCreate = 50;

            for ($i = 0; $i < $expensesToCreate; $i++) {
                Expense::factory()->create([
                    'user_id' => $user->id,
                    'category_id' => $expenseCategoryIds->random(),
                ]);
            }
        }
    }
}
