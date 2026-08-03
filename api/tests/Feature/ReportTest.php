<?php

namespace Tests\Feature;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\Expense;
use App\Models\Income;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private function actingUser(): User
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        return $user;
    }

    private function createExpense(User $user, Category $category, string $date, float|int $amount): Expense
    {
        return Expense::factory()->for($user)->create([
            'category_id' => $category->id,
            'amount' => $amount,
            'date' => $date,
        ]);
    }

    private function createIncome(User $user, Category $category, string $date, float|int $amount): Income
    {
        return Income::factory()->for($user)->create([
            'category_id' => $category->id,
            'amount' => $amount,
            'date' => $date,
        ]);
    }

    //Category Report Tests
    public function test_user_can_get_category_report(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createExpense($user, $category, '2026-01-05', 100);
        $this->createExpense($user, $category, '2026-01-15', 120);

        $response = $this->getJson("/api/reports/category?id={$category->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.category.id', $category->id)
            ->assertJsonPath('data.transaction_count', 2)
            ->assertJsonPath('data.total_amount', 220);
    }

    public function test_user_can_get_report_for_system_category(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => null,
            'type' => CategoryType::Expenses,
        ]);

        $this->createExpense($user, $category, '2026-02-10', 75);

        $response = $this->getJson("/api/reports/category?id={$category->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.category.id', $category->id)
            ->assertJsonPath('data.transaction_count', 1)
            ->assertJsonPath('data.total_amount', 75);
    }

    public function test_category_report_can_be_filtered_by_month_and_year(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createExpense($user, $category, '2026-01-05', 100);
        $this->createExpense($user, $category, '2026-01-15', 120);
        $this->createExpense($user, $category, '2026-02-01', 300);

        $response = $this->getJson("/api/reports/category?id={$category->id}&month=1&year=2026");

        $response
            ->assertOk()
            ->assertJsonPath('data.transaction_count', 2)
            ->assertJsonPath('data.total_amount', 220);
    }

    public function test_category_report_can_be_filtered_by_date_range(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createExpense($user, $category, '2026-01-05', 100);
        $this->createExpense($user, $category, '2026-01-15', 120);
        $this->createExpense($user, $category, '2026-02-01', 300);

        $response = $this->getJson("/api/reports/category?id={$category->id}&start_date=2026-01-10&end_date=2026-01-31");

        $response
            ->assertOk()
            ->assertJsonPath('data.transaction_count', 1)
            ->assertJsonPath('data.total_amount', 120);
    }

    public function test_category_report_without_filters_returns_all_transactions(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createExpense($user, $category, '2026-01-05', 100);
        $this->createExpense($user, $category, '2026-01-15', 120);
        $this->createExpense($user, $category, '2026-02-01', 300);

        $response = $this->getJson("/api/reports/category?id={$category->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.transaction_count', 3)
            ->assertJsonPath('data.total_amount', 520);
    }

    public function test_user_cannot_access_another_users_category(): void
    {
        $this->actingUser();
        $otherUser = User::factory()->create();

        $category = Category::factory()->create([
            'user_id' => $otherUser->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->getJson("/api/reports/category?id={$category->id}")
            ->assertNotFound();
    }

    public function test_category_report_only_includes_authenticated_users_transactions(): void
    {
        $user = $this->actingUser();
        $otherUser = User::factory()->create();

        $category = Category::factory()->create([
            'user_id' => null,
            'type' => CategoryType::Expenses,
        ]);

        $this->createExpense($user, $category, '2026-03-05', 150);
        $this->createExpense($otherUser, $category, '2026-03-05', 999);

        $response = $this->getJson("/api/reports/category?id={$category->id}");

        $response
            ->assertOk()
            ->assertJsonPath('data.transaction_count', 1)
            ->assertJsonPath('data.total_amount', 150);
    }

    public function test_category_id_is_required(): void
    {
        $this->actingUser();

        $this->getJson('/api/reports/category')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('id');
    }

    public function test_category_must_exist(): void
    {
        $this->actingUser();

        $this->getJson('/api/reports/category?id=999999')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('id');
    }

    public function test_month_requires_year(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->getJson("/api/reports/category?id={$category->id}&month=1")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('year');
    }

    public function test_year_requires_month(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->getJson("/api/reports/category?id={$category->id}&year=2026")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('month');
    }

    public function test_end_date_must_not_be_before_start_date(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->getJson("/api/reports/category?id={$category->id}&start_date=2026-01-10&end_date=2026-01-01")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('end_date');
    }

    public function test_empty_category_report_returns_zero_totals(): void
    {
        $user = $this->actingUser();

        $category = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->getJson("/api/reports/category?id={$category->id}")
            ->assertOk()
            ->assertJsonPath('data.category.id', $category->id)
            ->assertJsonPath('data.transaction_count', 0)
            ->assertJsonPath('data.total_amount', 0);
    }

    public function test_guest_cannot_access_category_report(): void
    {
        $category = Category::factory()->create([
            'user_id' => null,
            'type' => CategoryType::Expenses,
        ]);

        $this->getJson("/api/reports/category?id={$category->id}")
            ->assertUnauthorized();
    }

    //Monthly Report Tests
    public function test_user_can_get_monthly_report(): void
    {
        $user = $this->actingUser();

        $incomeCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Income,
        ]);

        $expenseCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createIncome($user, $incomeCategory, '2026-01-05', 500);
        $this->createExpense($user, $expenseCategory, '2026-01-06', 200);

        $response = $this->getJson('/api/reports/monthly?month=1&year=2026');

        $response
            ->assertOk()
            ->assertJsonPath('data.month', 1)
            ->assertJsonPath('data.year', 2026)
            ->assertJsonPath('data.total_income', 500)
            ->assertJsonPath('data.total_expenses', 200)
            ->assertJsonPath('data.balance', 300);
    }

    public function test_monthly_report_only_includes_transactions_for_specified_month(): void
    {
        $user = $this->actingUser();

        $incomeCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Income,
        ]);

        $expenseCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createIncome($user, $incomeCategory, '2026-01-05', 500);
        $this->createIncome($user, $incomeCategory, '2026-02-05', 700);
        $this->createExpense($user, $expenseCategory, '2026-01-06', 200);
        $this->createExpense($user, $expenseCategory, '2026-02-06', 300);

        $response = $this->getJson('/api/reports/monthly?month=1&year=2026');

        $response
            ->assertOk()
            ->assertJsonPath('data.total_income', 500)
            ->assertJsonPath('data.total_expenses', 200)
            ->assertJsonCount(1, 'data.income')
            ->assertJsonCount(1, 'data.expenses');
    }

    public function test_monthly_report_only_includes_transactions_for_specified_year(): void
    {
        $user = $this->actingUser();

        $incomeCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Income,
        ]);

        $expenseCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createIncome($user, $incomeCategory, '2025-01-05', 500);
        $this->createIncome($user, $incomeCategory, '2026-01-05', 700);
        $this->createExpense($user, $expenseCategory, '2025-01-06', 200);
        $this->createExpense($user, $expenseCategory, '2026-01-06', 300);

        $response = $this->getJson('/api/reports/monthly?month=1&year=2026');

        $response
            ->assertOk()
            ->assertJsonPath('data.total_income', 700)
            ->assertJsonPath('data.total_expenses', 300)
            ->assertJsonCount(1, 'data.income')
            ->assertJsonCount(1, 'data.expenses');
    }

    public function test_monthly_report_calculates_total_income(): void
    {
        $user = $this->actingUser();

        $incomeCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Income,
        ]);

        $this->createIncome($user, $incomeCategory, '2026-01-05', 150);
        $this->createIncome($user, $incomeCategory, '2026-01-15', 250);

        $this->getJson('/api/reports/monthly?month=1&year=2026')
            ->assertOk()
            ->assertJsonPath('data.total_income', 400);
    }

    public function test_monthly_report_calculates_total_expenses(): void
    {
        $user = $this->actingUser();

        $expenseCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createExpense($user, $expenseCategory, '2026-01-05', 100);
        $this->createExpense($user, $expenseCategory, '2026-01-15', 300);

        $this->getJson('/api/reports/monthly?month=1&year=2026')
            ->assertOk()
            ->assertJsonPath('data.total_expenses', 400);
    }

    public function test_monthly_report_calculates_balance(): void
    {
        $user = $this->actingUser();

        $incomeCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Income,
        ]);

        $expenseCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createIncome($user, $incomeCategory, '2026-01-05', 1000);
        $this->createExpense($user, $expenseCategory, '2026-01-06', 250);

        $this->getJson('/api/reports/monthly?month=1&year=2026')
            ->assertOk()
            ->assertJsonPath('data.balance', 750);
    }

    public function test_monthly_report_excludes_other_users_transactions(): void
    {
        $user = $this->actingUser();
        $otherUser = User::factory()->create();

        $incomeCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Income,
        ]);

        $expenseCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $otherIncomeCategory = Category::factory()->create([
            'user_id' => $otherUser->id,
            'type' => CategoryType::Income,
        ]);

        $otherExpenseCategory = Category::factory()->create([
            'user_id' => $otherUser->id,
            'type' => CategoryType::Expenses,
        ]);

        $this->createIncome($user, $incomeCategory, '2026-01-05', 500);
        $this->createExpense($user, $expenseCategory, '2026-01-06', 200);
        $this->createIncome($otherUser, $otherIncomeCategory, '2026-01-05', 999);
        $this->createExpense($otherUser, $otherExpenseCategory, '2026-01-06', 888);

        $response = $this->getJson('/api/reports/monthly?month=1&year=2026');

        $response
            ->assertOk()
            ->assertJsonPath('data.total_income', 500)
            ->assertJsonPath('data.total_expenses', 200)
            ->assertJsonCount(1, 'data.income')
            ->assertJsonCount(1, 'data.expenses');
    }

    public function test_monthly_report_returns_empty_collections_when_no_transactions_exist(): void
    {
        $this->actingUser();

        $response = $this->getJson('/api/reports/monthly?month=1&year=2026');

        $response
            ->assertOk()
            ->assertJsonPath('data.total_income', 0)
            ->assertJsonPath('data.total_expenses', 0)
            ->assertJsonPath('data.balance', 0)
            ->assertJsonPath('data.income', [])
            ->assertJsonPath('data.expenses', []);
    }

    public function test_month_is_required(): void
    {
        $this->actingUser();

        $this->getJson('/api/reports/monthly?year=2026')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('month');
    }

    public function test_year_is_required(): void
    {
        $this->actingUser();

        $this->getJson('/api/reports/monthly?month=1')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('year');
    }

    public function test_month_must_be_between_1_and_12(): void
    {
        $this->actingUser();

        $this->getJson('/api/reports/monthly?month=13&year=2026')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('month');
    }

    public function test_year_must_be_four_digits(): void
    {
        $this->actingUser();

        $this->getJson('/api/reports/monthly?month=1&year=26')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('year');
    }

    public function test_soft_deleted_income_records_are_excluded(): void
    {
        $user = $this->actingUser();

        $incomeCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Income,
        ]);

        $income = $this->createIncome($user, $incomeCategory, '2026-01-05', 500);
        $income->delete();

        $this->getJson('/api/reports/monthly?month=1&year=2026')
            ->assertOk()
            ->assertJsonPath('data.total_income', 0)
            ->assertJsonCount(0, 'data.income');
    }

    public function test_soft_deleted_expense_records_are_excluded(): void
    {
        $user = $this->actingUser();

        $expenseCategory = Category::factory()->create([
            'user_id' => $user->id,
            'type' => CategoryType::Expenses,
        ]);

        $expense = $this->createExpense($user, $expenseCategory, '2026-01-05', 200);
        $expense->delete();

        $this->getJson('/api/reports/monthly?month=1&year=2026')
            ->assertOk()
            ->assertJsonPath('data.total_expenses', 0)
            ->assertJsonCount(0, 'data.expenses');
    }

    public function test_guest_cannot_access_monthly_report(): void
    {
        $this->getJson('/api/reports/monthly?month=1&year=2026')
            ->assertUnauthorized();
    }
}
