<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ExpenseTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_index_own_expenses(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $user_cat = Category::factory()->for($user)->create([
            'type' => 'expenses',
        ]);

        $other_cat = Category::factory()->for($other)->create([
            'type' => 'expenses',
        ]);

        Expense::factory()->for($user)->create([
            'title' => 'Expense',
            'category_id' => $user_cat->id,
        ]);

        Expense::factory()->for($other)->create([
            'title' => 'Other Expense',
            'category_id' => $other_cat->id,
        ]);

        $response = $this->getJson('/api/expenses');

        $response->assertOk()
            ->assertJsonFragment([
                'title' => 'Expense',
            ])
            ->assertJsonMissing([
                'title' => 'Other Expense',
            ]);
    }
    public function test_user_receives_empty_expense_list_when_none_exist()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/expenses');

        $response
            ->assertOk()
            ->assertExactJson([
                'data' => [],
            ]);
    }
    public function test_guest_cannot_index_expenses(): void
    {
        $response = $this->getJson('/api/expenses');

        $response->assertUnauthorized();
    }

    public function test_user_can_create_expense_using_system_category()
    {
        $user = User::factory()->create();
        $user_cat = Category::factory()->create([
            'user_id' => null,
            'type' => 'expenses',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/expenses', [
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

    public function test_user_can_create_expense_using_own_category()
    {
        $user = User::factory()->create();
        $user_cat = Category::factory()->for($user)->create([
            'type' => 'expenses',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/expenses', [
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

    public function test_guest_cannot_create_expense()
    {
        $user_cat = Category::factory()->create([
            'type' => 'expenses',
        ]);

        $response = $this->postJson('/api/expenses', [
            "title" => "Lunch allowance",
            "amount" => 20.00,
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
        $response->assertUnauthorized();
    }

    public function test_user_cannot_create_expense_using_invalid_category_type()
    {

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $user_cat = Category::factory()->create([
            'type' => 'income',
        ]);

        $response = $this->postJson('/api/expenses', [
            "title" => "Lunch allowance",
            "amount" => 20.00,
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
        $response->assertUnprocessable();
    }

    public function test_user_cannot_create_expense_using_other_user_category()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $user_cat = Category::factory()->for($other)->create([
            'type' => 'expenses',
        ]);

        $response = $this->postJson('/api/expenses', [
            "title" => "Lunch allowance",
            "amount" => 20.00,
            "category_id" => $user_cat->id,
            "date" => "2026-07-28"
        ]);
        $response->assertUnprocessable();
    }

    public function test_created_expense_is_assigned_to_authenticated_user()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $category = Category::factory()->for($user)->create([
            'type' => 'expenses',
        ]);

        $response = $this->postJson('/api/expenses', [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $category->id,
            'date' => '2026-07-28',
            'user_id' => 999, // malicious attempt
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('expenses', [
            'title' => 'Salary',
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseMissing('expenses', [
            'title' => 'Salary',
            'user_id' => 999,
        ]);
    }

    public function test_user_cannot_create_expense_with_nonexistent_category()
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/expenses', [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => 99999,
            'date' => '2026-07-28',
        ]);

        $response->assertUnprocessable();
    }

    public function test_user_can_update_expense_using_own_category()
    {

        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($user)->create(['category_id' => $cat->id]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/expenses/{$exp->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $exp->category_id,
            'date' => '2026-07-28',
        ]);

        $response->assertOk()->assertJsonFragment([
            'title' => 'Salary',
            'amount' => "1000.00",
            'category_id' => $exp->category_id,
            'date' => '2026-07-28',
        ]);
    }

    public function test_user_can_update_expense_using_system_category()
    {

        $user = User::factory()->create();

        $cat = Category::factory()->create(['type' => 'expenses', 'user_id' => null]);
        $this->assertNull($cat->user_id);
        $exp = Expense::factory()->for($user)->create(['category_id' => $cat->id]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/expenses/{$exp->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $exp->category_id,
            'date' => '2026-07-28',
        ]);

        $response->assertOk()->assertJsonFragment([
            'title' => 'Salary',
            'amount' => "1000.00",
            'category_id' => $exp->category_id,
            'date' => '2026-07-28',
        ]);
    }
    public function test_user_can_partially_update_expense(): void
    {
        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create([
            'type' => 'expenses',
        ]);

        $exp = Expense::factory()->for($user)->create([
            'title' => 'Old Title',
            'category_id' => $cat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/expenses/{$exp->id}", [
            'title' => 'New Title',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('expenses', [
            'id' => $exp->id,
            'title' => 'New Title',
            'category_id' => $cat->id,
        ]);
    }

    public function test_user_cannot_update_others_expense(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $cat = Category::factory()->for($user)->create([
            'type' => 'expenses',
        ]);

        $otherCat = Category::factory()->for($other)->create([
            'type' => 'expenses',
        ]);

        $exp = Expense::factory()->for($other)->create([
            'category_id' => $otherCat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/expenses/{$exp->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $cat->id,
            'date' => '2026-07-28',
        ]);

        $response->assertNotFound();
    }

    public function test_user_cannot_update_own_expense_using_others_category(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);
        $otherCat = Category::factory()->for($other)->create(['type' => 'expenses']);

        $exp = Expense::factory()->for($user)->create([
            'category_id' => $cat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/expenses/{$exp->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $otherCat->id,
            'date' => '2026-07-28',
        ]);

        $response->assertUnprocessable();
    }

    public function test_user_cannot_update_own_expense_using_invalid_category(): void
    {
        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);

        $exp = Expense::factory()->for($user)->create([
            'category_id' => $cat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/expenses/{$exp->id}", [
            'category_id' => 99, //invalid
        ]);

        $response->assertUnprocessable();
    }

    public function test_user_cannot_update_own_expense_using_invalid_date(): void
    {
        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);

        $exp = Expense::factory()->for($user)->create([
            'category_id' => $cat->id,
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/expenses/{$exp->id}", [
            'date' => 99, //invalid
        ]);

        $response->assertUnprocessable();
    }

    public function test_guest_cannot_update_expense()
    {

        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->patchJson("/api/expenses/{$exp->id}", [
            'title' => 'Salary',
            'amount' => 1000,
            'category_id' => $exp->category_id,
            'date' => '2026-07-28',
        ]);

        $response->assertUnauthorized();
    }

    public function test_user_can_view_own_expense()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->getJson("/api/expenses/{$exp->id}");

        $response->assertOk();

        $response->assertJson([
            'data' => [
                'id' => $exp->id,
                'title' => $exp->title,
                'amount' => $exp->amount,
                'category_id' => $exp->category_id,
                'date' => $exp->date->toDateString()
            ]
        ]);
    }

    public function test_guest_cannot_view_expense()
    {
        $user = User::factory()->create();

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->getJson("/api/expenses/{$exp->id}");

        $response->assertUnauthorized();
    }

    public function test_user_cannot_view_others_expense()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->for($other)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($other)->create(['category_id' => $cat->id]);

        $response = $this->getJson("/api/expenses/{$exp->id}");

        $response->assertNotFound();
    }

    public function test_user_can_delete_expense(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->deleteJson("/api/expenses/{$exp->id}");

        $response->assertOk();

        $this->assertSoftDeleted('expenses', [
            'id' => $exp->id,
        ]);
    }

    public function test_user_cannot_delete_others_expense(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Sanctum::actingAs($user);

        $cat = Category::factory()->for($other)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($other)->create(['category_id' => $cat->id]);

        $response = $this->deleteJson("/api/expenses/{$exp->id}");

        $response->assertNotFound();
    }

    public function test_user_can_restore_expense(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($user)->create(['category_id' => $cat->id]);
        $exp->delete();

        $response = $this->patchJson("/api/expenses/{$exp->id}/restore");

        $response->assertOk();

        $this->assertDatabaseHas('expenses', [
            'id' => $exp->id,
            'deleted_at' => null,
        ]);
    }

    public function test_user_cannot_restore_others_expense(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($user);


        $cat = Category::factory()->for($other)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($other)->create(['category_id' => $cat->id]);

        $exp->delete();

        $response = $this->patchJson("/api/expenses/{$exp->id}/restore");

        $response->assertNotFound();
    }

    public function test_user_cannot_restore_active_expense(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $cat = Category::factory()->for($user)->create(['type' => 'expenses']);
        $exp = Expense::factory()->for($user)->create(['category_id' => $cat->id]);

        $response = $this->patchJson("/api/expenses/{$exp->id}/restore");

        $response->assertNotFound();
    }
}
