<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Expense\StoreRequest;
use App\Http\Requests\Expense\UpdateRequest;
use App\Http\Resources\ExpenseResource;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $exp = $request->user()->expenses;
        $sum = number_format($request->user()->expenses->sum('amount'), 2, '.', '');
        $this_week = number_format($request->user()
            ->expenses()
            ->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('amount'), 2, '.', '');

        $this_month = number_format($request->user()
            ->expenses()
            ->whereBetween('date', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->sum('amount'), 2, '.', '');

        return response()->json([
            'data' => ExpenseResource::collection($exp),
            'sum' => $sum,
            'this_week' => $this_week,
            'this_month' => $this_month

        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        $exp = $request->user()->expenses()->create($request->validated());
        return response()->json([
            'message' => 'Expense created successfully.',
            'data' => new ExpenseResource($exp)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $exp = $request->user()->expenses()->findOrFail($id);

        return response()->json([
            'data' => new ExpenseResource($exp)
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, int $id): JsonResponse
    {
        $exp =  $request->user()->expenses()->findOrFail($id);
        $exp->update($request->validated());

        return response()->json([
            'message' => 'Expense updated successfully.',
            'data' => new ExpenseResource($exp),
        ], 200);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $exp =  $request->user()->expenses()->findOrFail($id);

        $exp->delete();

        return response()->json([
            'message' => 'Expense deleted successfully.',
        ]);
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(Request $request, int $id): JsonResponse
    {

        $exp = $request->user()->expenses()->onlyTrashed()->findOrFail($id);

        $exp->restore();

        return response()->json([
            'message' => 'Expense restored successfully.',
        ]);
    }
}
