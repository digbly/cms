<?php

namespace Modules\Admin\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    properties: [
        new OA\Property(property: 'search', type: 'string', nullable: true, example: 'john'),
        new OA\Property(property: 'role', type: 'string', nullable: true, example: 'editor'),
        new OA\Property(property: 'trashed', type: 'string', enum: ['only', 'with'], nullable: true),
        new OA\Property(property: 'sort', type: 'string', enum: ['name', 'email', 'created_at'], nullable: true),
        new OA\Property(property: 'direction', type: 'string', enum: ['asc', 'desc'], nullable: true),
        new OA\Property(property: 'per_page', type: 'integer', minimum: 1, maximum: 100, nullable: true),
        new OA\Property(property: 'page', type: 'integer', minimum: 1, nullable: true),
    ]
)]
class IndexUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'trashed' => ['nullable', Rule::in(['only', 'with'])],
            'sort' => ['nullable', Rule::in(['name', 'email', 'created_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
