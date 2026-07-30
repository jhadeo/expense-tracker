<?php

namespace App\Http\Requests\Category;

use App\Enums\CategoryType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', 
                Rule::unique('categories')
                    ->where(fn($query) => $query->where(
                        'user_id',
                        $this->user()->id
                )),],
            'type' => ['required', new Enum(CategoryType::class)]
        ];
    }
}
