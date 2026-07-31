<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable('title', 'user_id', 'category_id', 'amount', 'date')]
class Income extends Model
{
    use SoftDeletes, HasFactory;
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'date' => 'date'
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
