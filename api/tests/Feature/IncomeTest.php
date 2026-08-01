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

    public function test_user_can_update_income_using_own_category()
    {

        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'income']);
        $inc = Income::factory()->for($user)->create(['category_id' => $cat->id]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/incomes/{$inc->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $inc->category_id,
            'date' => '2026-07-28',
        ]);

        $response->assertOk()->assertJsonFragment([
            'title' => 'Salary',
            'amount' => "1000.00",
            'category_id' => $inc->category_id,
            'date' => '2026-07-28',
        ]);
    }

    public function test_user_can_update_income_using_system_category()
    {

        $user = User::factory()->create();

        $cat = Category::factory()->create(['type' => 'income', 'user_id' => null]);
        $this->assertNull($cat->user_id);
        $inc = Income::factory()->for($user)->create(['category_id' => $cat->id]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/incomes/{$inc->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $inc->category_id,
            'date' => '2026-07-28',
        ]);

        $response->assertOk()->assertJsonFragment([
            'title' => 'Salary',
            'amount' => "1000.00",
            'category_id' => $inc->category_id,
            'date' => '2026-07-28',
        ]);
    }
    public function test_user_can_partially_update_income(): void
    {
        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create([
            'type' => 'income',
        ]);

        $inc = Income::factory()->for($user)->create([
            'title' => 'Old Title',
            'category_id' => $cat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/incomes/{$inc->id}", [
            'title' => 'New Title',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('incomes', [
            'id' => $inc->id,
            'title' => 'New Title',
            'category_id' => $cat->id,
        ]);
    }

    public function test_user_cannot_update_others_income(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $cat = Category::factory()->for($user)->create([
            'type' => 'income',
        ]);

        $otherCat = Category::factory()->for($other)->create([
            'type' => 'income',
        ]);

        $inc = Income::factory()->for($other)->create([
            'category_id' => $otherCat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/incomes/{$inc->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $cat->id,
            'date' => '2026-07-28',
        ]);

        $response->assertNotFound();
    }

    public function test_user_cannot_update_own_income_using_others_category(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'income']);
        $otherCat = Category::factory()->for($other)->create(['type' => 'income']);

        $inc = Income::factory()->for($user)->create([
            'category_id' => $cat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/incomes/{$inc->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $otherCat->id,
            'date' => '2026-07-28',
        ]);

        $response->assertUnprocessable();
    }

    public function test_user_cannot_update_own_income_using_invalid_category(): void
    {
        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'income']);

        $inc = Income::factory()->for($user)->create([
            'category_id' => $cat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/incomes/{$inc->id}", [
            'category_id' => 99, //invalid
        ]);

        $response->assertUnprocessable();
    }

    public function test_user_cannot_update_own_income_using_invalid_date(): void
    {
        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'income']);

        $inc = Income::factory()->for($user)->create([
            'category_id' => $cat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/incomes/{$inc->id}", [
            'date' => 99, //invalid
        ]);

        $response->assertUnprocessable();
    }

    public function test_guest_cannot_update_income()
    {

        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'income']);
        $inc = Income::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->patchJson("/api/incomes/{$inc->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $inc->category_id,
            'date' => '2026-07-28',
        ]);

        $response->assertUnauthorized();
    }

    public function test_user_can_view_own_income()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create(['type' => 'income']);
        $inc = Income::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->getJson("/api/incomes/{$inc->id}");

        $response->assertOk();

        $response->assertJson([
            'data' => [
                'id' => $inc->id,
                'title' => $inc->title,
                'amount' => $inc->amount,
                'category_id' => $inc->category_id,
                'date' => $inc->date->toDateString()
            ]
        ]);
    }

    public function test_guest_cannot_view_income()
    {
        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'income']);
        $inc = Income::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->getJson("/api/incomes/{$inc->id}");

        $response->assertUnauthorized();
    }

    public function test_user_cannot_view_others_income()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->for($other)->create(['type' => 'income']);
        $inc = Income::factory()->for($other)->create(['category_id' => $cat->id]);

        $response = $this->getJson("/api/incomes/{$inc->id}");

        $response->assertNotFound();
    }

    public function test_user_can_delete_income(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create(['type' => 'income']);
        $inc = Income::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->deleteJson("/api/incomes/{$inc->id}");

        $response->assertOk();

        $this->assertSoftDeleted('incomes', [
            'id' => $inc->id,
        ]);
    }

    public function test_user_cannot_delete_others_income(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->for($other)->create(['type' => 'income']);
        $inc = Income::factory()->for($other)->create(['category_id' => $cat->id]);

        $response = $this->deleteJson("/api/incomes/{$inc->id}");

        $response->assertNotFound();
    }

    public function test_user_can_restore_income(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create(['type' => 'income']);
        $inc = Income::factory()->for($user)->create(['category_id' => $cat->id]);
        $inc->delete();

        $response = $this->patchJson("/api/incomes/{$inc->id}/restore");

        $response->assertOk();

        $this->assertDatabaseHas('incomes', [
            'id' => $inc->id,
            'deleted_at' => null,
        ]);
    }

    public function test_user_cannot_restore_others_income(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($user);


        $cat = Category::factory()->for($other)->create(['type' => 'income']);
        $inc = Income::factory()->for($other)->create(['category_id' => $cat->id]);

        $inc->delete();

        $response = $this->patchJson("/api/incomes/{$inc->id}/restore");

        $response->assertNotFound();
    }

    public function test_user_cannot_restore_active_income(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create(['type' => 'income']);
        $inc = Income::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->patchJson("/api/incomes/{$inc->id}/restore");

        $response->assertNotFound();
    }
}
