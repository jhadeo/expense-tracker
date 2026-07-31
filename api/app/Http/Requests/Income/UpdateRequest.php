<?php

namespace App\Http\Requests\Income;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\CategoryType;
class UpdateRequest extends FormRequest
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
            'title' => ['sometimes', 'string', 'max:255'],
            'amount' => ['sometimes', 'numeric', 'min:1'],
            'category_id' => [
                'sometimes',
                Rule::exists('categories', 'id')
                    ->where(function ($query) {
                        $query->where('user_id', $this->user()->id)
                            ->orWhereNull('user_id');
                    })
                    ->where('type', CategoryType::Income),
            ],
            'date' => ['sometimes', 'date']
        ];
    }
}
