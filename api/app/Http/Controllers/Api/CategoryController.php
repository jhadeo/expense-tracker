<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Category\StoreRequest;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\UpdateRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $cat = Category::where(function ($query) use ($request) {
            $query->where('user_id', $request->user()->id)
                ->orWhereNull('user_id');
        })->get();

        return response()->json([
            "data" => CategoryResource::collection($cat)
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request): JsonResponse
    {

        $cat = $request->user()->categories()->create($request->validated());
        return response()->json([
            'message' => 'Category created successfully.',
            'data' => new CategoryResource($cat)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, int $id): JsonResponse
    {

        $cat = Category::where('id', $id)
            ->where(function ($query) use ($request) {
                $query->where('user_id', $request->user()->id)
                    ->orWhereNull('user_id');
            })
            ->firstOrFail();

        return response()->json([
            'data' => new CategoryResource($cat)
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, int $id): JsonResponse
    {
        $cat = Category::findOrFail($id);

        if (is_null($cat->user_id)) {
            return response()->json([
                'message' => 'System categories can not be edited.',
            ], 403);
        }

        $cat = $request->user()->categories()->findOrFail($id);
        $cat->update($request->validated());

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => new CategoryResource($cat),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if (is_null($category->user_id)) {
            return response()->json([
                'message' => 'System categories cannot be deleted.',
            ], 403);
        }

        if ($category->user_id !== $request->user()->id) {
            abort(404);
        }

        if ($category->expenses()->exists() || $category->incomes()->exists()) {
            return response()->json([
                'message' => 'Category cannot be deleted because it has transactions.',
            ], 409);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ]);
    }

    /**
     * Restore the specified resource from storage.
     */
    public function restore(Request $request, int $id): JsonResponse
    {
        $category = Category::onlyTrashed()->findOrFail($id);

        if (is_null($category->user_id)) {
            return response()->json([
                'message' => 'System categories can not restored.',
            ], 403);
        }

        $category = $request->user()->categories()->onlyTrashed()->findOrFail($id);

        $category->restore();

        return response()->json([
            'message' => 'Category restored successfully.',
        ]);
    }
}
