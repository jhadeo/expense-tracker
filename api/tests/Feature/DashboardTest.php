<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Category;
use App\Enums\CategoryType;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class DashboardTest extends TestCase
{
    use RefreshDatabase;
    public function test_user_with_no_data_sees_empty_dashboard_data(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard');

        $response->assertOk()->assertJson([
            'data' => [
                'total_income' => 0,
                'total_expenses' => 0,
                'recent_incomes' => [],
                'recent_expenses' => [],
                'monthly_summary' => [],
                'balance' => 0,
            ]
        ]);
    }

    public function test_user_with_own_data_sees_own_dashboard_data(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $inc_cat = Category::factory()->create(['type' => CategoryType::Income]);
        $exp_cat = Category::factory()->create(['type' => CategoryType::Expenses]);
        $inc_cat_user = Category::factory()->for($user)->create(['type' => CategoryType::Income]);
        $exp_cat_user = Category::factory()->for($user)->create(['type' => CategoryType::Expenses]);

        Income::factory()
            ->for($user)
            ->create([
                'category_id' => $inc_cat->id,
                'amount' => 5000,
                'date' => '2026-07-15',
            ]);

        Income::factory()
            ->for($user)
            ->create([
                'category_id' => $inc_cat_user->id,
                'amount' => 5000,
                'date' => '2026-08-15',
            ]);

        Expense::factory()
            ->for($user)
            ->create([
                'category_id' => $exp_cat->id,
                'amount' => 3200,
                'date' => '2026-07-20',
            ]);

        Expense::factory()
            ->for($user)
            ->create([
                'category_id' => $exp_cat_user->id,
                'amount' => 3200,
                'date' => '2026-08-20',
            ]);


        $response = $this->getJson('/api/dashboard');

        $response
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'total_income',
                    'total_expenses',
                    'recent_incomes',
                    'recent_expenses',
                    'monthly_summary',
                    'balance',
                ]
            ])
            ->assertJson([
                'data' => [
                    'total_income' => '10000.00',
                    'total_expenses' => '6400.00',
                    'balance' => '3600.00',
                ]
            ]);

        $this->assertCount(2, $response->json('data.recent_incomes'));
        $this->assertCount(2, $response->json('data.recent_expenses'));

        $this->assertEquals([
            [
                'month' => '2026-07',
                'income' => '5000.00',
                'expenses' => '3200.00',
            ],
            [
                'month' => '2026-08',
                'income' => '5000.00',
                'expenses' => '3200.00',
            ],
        ], $response->json('data.monthly_summary'));
    }

    public function test_guest_cannot_access_dashboard(): void
    {
        $response = $this->getJson('/api/dashboard');

        $response->assertUnauthorized();
    }

    public function test_user_can_not_see_others_data(): void
    {
        $user = User::factory()->create();
        $user2 = User::factory()->create();
        Sanctum::actingAs($user2);

        $inc_cat = Category::factory()->create(['type' => CategoryType::Income]);
        $exp_cat = Category::factory()->create(['type' => CategoryType::Expenses]);

        Income::factory()
            ->for($user)
            ->create([
                'category_id' => $inc_cat->id,
                'amount' => 5000,
                'date' => '2026-07-15',
            ]);

        Expense::factory()
            ->for($user)
            ->create([
                'category_id' => $exp_cat->id,
                'amount' => 3200,
                'date' => '2026-07-20',
            ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertOk()->assertJson([
            'data' => [
                'total_income' => 0,
                'total_expenses' => 0,
                'recent_incomes' => [],
                'recent_expenses' => [],
                'monthly_summary' => [],
                'balance' => 0,
            ]
        ]);
    }

    public function test_user_can_get_only_expense_details_from_dashboard(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $exp_cat = Category::factory()->create(['type' => CategoryType::Expenses]);

        Expense::factory()
            ->for($user)
            ->create([
                'category_id' => $exp_cat->id,
                'amount' => 3200,
                'date' => '2026-07-20',
            ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertOk();

        $this->assertCount(1, $response->json('data.recent_expenses'));

        $this->assertEquals([
            [
                'month' => '2026-07',
                'income' => '0',
                'expenses' => '3200.00',
            ],
        ], $response->json('data.monthly_summary'));
    }

        public function test_user_can_get_only_income_details_from_dashboard(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $inc_cat = Category::factory()->create(['type' => CategoryType::Income]);

        Income::factory()
            ->for($user)
            ->create([
                'category_id' => $inc_cat->id,
                'amount' => 3200,
                'date' => '2026-07-20',
            ]);

        $response = $this->getJson('/api/dashboard');

        $response->assertOk();

        $this->assertCount(1, $response->json('data.recent_incomes'));

        $this->assertEquals([
            [
                'month' => '2026-07',
                'income' => '3200.00',
                'expenses' => '0',
            ],
        ], $response->json('data.monthly_summary'));
    }
}
