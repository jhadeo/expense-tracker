<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $total_income = $request->user()->incomes()->sum('amount');
        $total_expense = $request->user()->expenses()->sum('amount');

        $balance = $total_income - $total_expense;

        $recent_incomes = $request->user()
            ->incomes()
            ->latest('date')
            ->limit(5)
            ->select(
                'id',
                'title',
                'amount',
                'date'
            )->get();

        $recent_expenses = $request->user()
            ->expenses()
            ->latest('date')
            ->limit(5)
            ->select(
                'id',
                'title',
                'amount',
                'date'
            )->get();

        $monthly_expense = $request->user()
            ->expenses()
            ->selectRaw("TO_CHAR(date, 'YYYY-MM') AS month, SUM(amount) AS expenses")
            ->groupByRaw("TO_CHAR(date, 'YYYY-MM')")
            ->orderBy('month')
            ->get();

        $monthly_income = $request->user()
            ->incomes()
            ->selectRaw("TO_CHAR(date, 'YYYY-MM') AS month, SUM(amount) AS income")
            ->groupByRaw("TO_CHAR(date, 'YYYY-MM')")
            ->orderBy('month')
            ->get();

        $monthly_summary = [];

        foreach ($monthly_expense as $expense) {
            $monthly_summary[$expense->month] = [
                'month' => $expense->month,
                'income' => 0,
                'expenses' => $expense->expenses
            ];
        }

        foreach ($monthly_income as $income) {

            if (!isset($monthly_summary[$income->month])) {
                $monthly_summary[$income->month] = [
                    'month' => $income->month,
                    'income' => $income->income,
                    'expenses' => 0
                ];
            } else {
                $monthly_summary[$income->month]['income'] = $income->income;
            }
        }

        return response()->json([
            'data' => [
                'total_income' => $total_income,
                'total_expenses' => $total_expense,
                'recent_incomes' => $recent_incomes,
                'recent_expenses' => $recent_expenses,
                'monthly_summary' => collect($monthly_summary)->values(),
                'balance' => $balance,
            ]
        ], 200);
    }
}
