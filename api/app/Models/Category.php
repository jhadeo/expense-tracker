<?php

namespace App\Models;

use App\Enums\CategoryType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


#[Fillable(['name', 'type', 'user_id'])]
class Category extends Model
{
    use SoftDeletes;
    protected function casts(): array
    {
        return ['type' => CategoryType::class];
        
    }
}
