<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Income;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class IncomeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_index_own_incomes(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $user_cat = Category::factory()->for($user)->create([
            'type' => 'income',
        ]);

        $other_cat = Category::factory()->for($other)->create([
            'type' => 'income',
        ]);

        Income::factory()->for($user)->create([
            'title' => 'Salary',
            'category_id' => $user_cat->id,
        ]);

        Income::factory()->for($other)->create([
            'title' => 'Other Salary',
            'category_id' => $other_cat->id,
        ]);

        $response = $this->getJson('/api/incomes');

        $response->assertOk()
            ->assertJsonFragment([
                'title' => 'Salary',
            ])
            ->assertJsonMissing([
                'title' => 'Other Salary',
            ]);
    }
    public function test_user_receives_empty_income_list_when_none_exist()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/incomes');

        $response
            ->assertOk()
            ->assertExactJson([
                'data' => [],
            ]);
    }
    public function test_guest_cannot_index_incomes(): void
    {
        $response = $this->getJson('/api/incomes');

        $response->assertUnauthorized();
    }

    public function test_user_can_create_income_using_system_category()
    {
        $user = User::factory()->create();
        $user_cat = Category::factory()->create([
            'user_id' => null,
            'type' => 'income',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/incomes', [
            "title" => "Lunch allowance",
            "amount" => 20.00,
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
        $response->assertCreated()->assertJsonFragment([
            "title" => "Lunch allowance",
            "amount" => "20.00",
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
    }

    public function test_user_can_create_income_using_own_category()
    {
        $user = User::factory()->create();
        $user_cat = Category::factory()->for($user)->create([
            'type' => 'income',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/incomes', [
            "title" => "Lunch allowance",
            "amount" => 20.00,
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
        $response->assertCreated()->assertJsonFragment([
            "title" => "Lunch allowance",
            "amount" => "20.00",
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
    }

    public function test_guest_cannot_create_income()
    {
        $user_cat = Category::factory()->create([
            'type' => 'income',
        ]);

        $response = $this->postJson('/api/incomes', [
            "title" => "Lunch allowance",
            "amount" => 20.00,
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
        $response->assertUnauthorized();
    }

    public function test_user_cannot_create_income_using_invalid_category_type()
    {

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $user_cat = Category::factory()->create([
            'type' => 'expenses',
        ]);

        $response = $this->postJson('/api/incomes', [
            "title" => "Lunch allowance",
            "amount" => 20.00,
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
        $response->assertUnprocessable();
    }

    public function test_user_cannot_create_income_using_other_user_category()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $user_cat = Category::factory()->for($other)->create([
            'type' => 'income',
        ]);

        $response = $this->postJson('/api/incomes', [
            "title" => "Lunch allowance",
            "amount" => 20.00,
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
        $response->assertUnprocessable();
    }

    public function test_created_income_is_assigned_to_authenticated_user()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $category = Category::factory()->for($user)->create([
            'type' => 'income',
        ]);

        $response = $this->postJson('/api/incomes', [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $category->id,
            'date' => '2026-07-28',
            'user_id' => 999, // malicious attempt
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('incomes', [
            'title' => 'Salary',
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseMissing('incomes', [
            'title' => 'Salary',
            'user_id' => 999,
        ]);
    }

    public function test_user_cannot_create_income_with_nonexistent_category()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/incomes', [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => 99999,
            'date' => '2026-07-28',
        ]);

        $response->assertUnprocessable();
    }
}
