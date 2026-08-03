<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Category;
use App\Enums\CategoryType;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

}
