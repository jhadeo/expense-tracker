<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Income\StoreRequest;
use App\Http\Requests\Income\UpdateRequest;
use App\Http\Resources\IncomeResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class IncomeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $inc = $request->user()->incomes;

        $sum = number_format($request->user()->incomes->sum('amount'), 2, '.', '');
        $this_week = number_format($request->user()
            ->incomes()
            ->whereBetween('date', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('amount'), 2, '.', '');

        $this_month = number_format($request->user()
            ->incomes()
            ->whereBetween('date', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->sum('amount'), 2, '.', '');

        return response()->json([
            'data' => IncomeResource::collection($inc),
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
        $inc = $request->user()->incomes()->create($request->validated());
        return response()->json([
            'message' => 'Income created successfully.',
            'data' => new IncomeResource($inc)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $inc = $request->user()->incomes()->findOrFail($id);

        return response()->json([
            'data' => new IncomeResource($inc)
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, int $id): JsonResponse
    {
        $inc =  $request->user()->incomes()->findOrFail($id);
        $inc->update($request->validated());

        return response()->json([
            'message' => 'Income updated successfully.',
            'data' => new IncomeResource($inc),
        ], 200);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $inc =  $request->user()->incomes()->findOrFail($id);

        $inc->delete();

        return response()->json([
            'message' => 'Income deleted successfully.',
        ]);
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(Request $request, int $id): JsonResponse
    {

        $inc = $request->user()->incomes()->onlyTrashed()->findOrFail($id);

        $inc->restore();

        return response()->json([
            'message' => 'Income restored successfully.',
        ]);
    }
}
