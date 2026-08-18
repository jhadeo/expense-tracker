<?php

namespace App\Http\Controllers\Api;

use App\Enums\CategoryType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\CategoryReportRequest;
use App\Http\Requests\Reports\ReportMonthlyRequest;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function index_category(CategoryReportRequest $request): JsonResponse
    {
        $category = Category::where('id', $request->validated('id'))
            ->where(function ($query) use ($request) {
                $query->whereNull('user_id')
                    ->orWhereBelongsTo($request->user());
            })
            ->firstOrFail();

        $relationship = match ($category->type) {
            CategoryType::Expenses => 'expenses',
            CategoryType::Income => 'incomes',
        };

        $query = $request->user()
            ->{$relationship}()
            ->where('category_id', $category->id);

        if ($request->filled('month') && $request->filled('year')) {
            $query->whereMonth('date', $request->integer('month'))
                ->whereYear('date', $request->integer('year'));
        }

        if ($request->filled('start_date')) {
            $query->whereDate('date', '>=', $request->date('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('date', '<=', $request->date('end_date'));
        }

        $transactions = $query->orderBy('date')->get();

        return response()->json([
            'data' => [
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'type' => $category->type,
                ],
                'period' => [
                    'month' => $request->input('month'),
                    'year' => $request->input('year'),
                ],
                'transaction_count' => $transactions->count(),
                'total_amount' => $transactions->sum('amount'),
                'transactions' => $transactions,
            ],
        ]);
    }

    public function index_monthly(ReportMonthlyRequest $request): JsonResponse
    {
        $incomeQuery = $request->user()->incomes()
            ->whereMonth('date', $request->integer('month'))
            ->whereYear('date', $request->integer('year'));

        $expenseQuery = $request->user()->expenses()
            ->whereMonth('date', $request->integer('month'))
            ->whereYear('date', $request->integer('year'));

        $income = $incomeQuery->with('category')->get();
        $expenses = $expenseQuery->with('category')->get();

        $income = $income->map(function ($income) {
            return [
                'id' => $income->id,
                'title' => $income->title,
                'amount' => $income->amount,
                'category' => $income->category->name,
                'date' => $income->date,
            ];
        });

        $expenses = $expenses->map(function ($expense) {
            return [
                'id' => $expense->id,
                'title' => $expense->title,
                'amount' => $expense->amount,
                'category' => $expense->category->name,
                'date' => $expense->date,
            ];
        });

        $totalIncome = $income->sum('amount');
        $totalExpenses = $expenses->sum('amount');
        $balance = $totalIncome - $totalExpenses;

        return response()->json([
            'data' => [
                'month' => $request->integer('month'),
                'year' => $request->integer('year'),
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'balance' => $balance,
                'income' => $income,
                'expenses' => $expenses,
            ],
        ]);
    }
}
