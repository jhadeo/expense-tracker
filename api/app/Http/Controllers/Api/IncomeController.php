<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Income\StoreRequest;
use App\Http\Requests\Income\UpdateRequest;
use App\Http\Resources\IncomeResource;
use App\Models\Income;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $inc = $request->user()->incomes;

        return response()->json([
            'data' => IncomeResource::collection($inc)
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
    public function show(Income $income)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, int $id)
    {
        $inc =  $request->user()->incomes()->findOrFail($id);
        $inc->update($request->validated());

        return response()->json([
            'message' => 'Income updated successfully.',
            'data' => new IncomeResource($inc),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Income $income)
    {
        //
    }
}
