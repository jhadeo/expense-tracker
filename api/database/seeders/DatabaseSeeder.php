<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(['email' => 'test@example.com'], [
            'first_name' => 'Test User',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'password' => 'password'
        ]);

        User::factory()->create();

        $this->call([
            CategorySeeder::class,
            ExpenseSeeder::class,
            IncomeSeeder::class,
        ]);
    }
}
