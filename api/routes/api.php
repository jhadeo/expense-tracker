<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\IncomeController;
use Illuminate\Support\Facades\Route;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::name('category.')->prefix('categories')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::post('/', [CategoryController::class, 'store']);
        Route::patch('/{id}', [CategoryController::class, 'update']);
        Route::get('/{id}', [CategoryController::class, 'show']);
        Route::delete('/{id}', [CategoryController::class, 'destroy']);
        Route::put('/{id}/restore', [CategoryController::class, 'restore']);
    });

    Route::name('income.')->prefix('incomes')->group(function () {
        Route::get('/', [IncomeController::class, 'index']);
        Route::post('/', [IncomeController::class, 'store']);
        Route::get('/{id}', [IncomeController::class, 'show']);
        Route::patch('/{id}', [IncomeController::class, 'update']);
        Route::delete('/{id}', [IncomeController::class, 'destroy']);
        Route::patch('/{id}/restore', [IncomeController::class, 'restore']);
    });

    Route::name('expense.')->prefix('expenses')->group(function () {
        Route::get('/', [ExpenseController::class, 'index']);
        Route::post('/', [ExpenseController::class, 'store']);
        Route::get('/{id}', [ExpenseController::class, 'show']);
        Route::patch('/{id}', [ExpenseController::class, 'update']);
        Route::delete('/{id}', [ExpenseController::class, 'destroy']);
        Route::patch('/{id}/restore', [ExpenseController::class, 'restore']);

    });

    Route::get('/dashboard', [DashboardController::class,'index']);
});
