<?php

namespace Database\Seeders;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\Income;
use App\Models\User;

use Illuminate\Database\Seeder;

class IncomeSeeder extends Seeder
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

        $incomeCategoryIds = Category::query()
            ->where('type', CategoryType::Income)
            ->pluck('id');

        if ($incomeCategoryIds->isEmpty()) {
            return;
        }

        foreach ($users as $user) {
            $incomesToCreate = random_int(3, 8);

            for ($i = 0; $i < $incomesToCreate; $i++) {
                Income::factory()->create([
                    'user_id' => $user->id,
                    'category_id' => $incomeCategoryIds->random(),
                ]);
            }
        }
    }
}
