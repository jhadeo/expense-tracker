<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $total_income = $request->user()->incomes()->sum('amount');
        $total_expense = $request->user()->expenses()->sum('amount');

        $balance = number_format(($total_income - $total_expense), 2, '.', '');

        $recent_incomes = $request->user()
            ->incomes()
            ->latest('date')
            ->limit(5)
            ->select('id', 'title', 'amount', 'date')
            ->get();

        $recent_expenses = $request->user()
            ->expenses()
            ->latest('date')
            ->limit(5)
            ->select('id', 'title', 'amount', 'date')
            ->get();

        $monthly_summary = $this->getMonthlySummary($request);

        $perPage = max(1, (int) $request->integer('per_page', 10));
        $page = max(1, (int) $request->integer('page', 1));

        $paginated_summary = new LengthAwarePaginator(
            $monthly_summary->forPage($page, $perPage)->values(),
            $monthly_summary->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return response()->json([
            'data' => [
                'total_income' => $total_income,
                'total_expenses' => $total_expense,
                'recent_incomes' => $recent_incomes,
                'recent_expenses' => $recent_expenses,
                'monthly_summary' => $paginated_summary,
                'balance' => $balance,
            ]
        ], 200);
    }

    /**
     * Build a merged, sorted collection of monthly income/expense totals.
     */
    private function getMonthlySummary(Request $request): Collection
    {
        $monthly_expense = $request->user()
            ->expenses()
            ->selectRaw("TO_CHAR(date, 'YYYY-MM') AS month, SUM(amount) AS total")
            ->groupByRaw("TO_CHAR(date, 'YYYY-MM')")
            ->pluck('total', 'month');

        $monthly_income = $request->user()
            ->incomes()
            ->selectRaw("TO_CHAR(date, 'YYYY-MM') AS month, SUM(amount) AS total")
            ->groupByRaw("TO_CHAR(date, 'YYYY-MM')")
            ->pluck('total', 'month');

        $months = $monthly_income->keys()
            ->merge($monthly_expense->keys())
            ->unique()
            ->sort()
            ->values();

        return $months->map(fn($month) => [
            'month' => $month,
            'income' => (float) ($monthly_income[$month] ?? 0),
            'expenses' => (float) ($monthly_expense[$month] ?? 0),
        ]);
    }
}
