<?php

namespace Modules\Blog\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Blog\Enums\CommentStatus;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    properties: [
        new OA\Property(property: 'search', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'approved', 'spam', 'rejected'], nullable: true),
        new OA\Property(property: 'post_id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(property: 'sort', type: 'string', enum: ['created_at', 'updated_at'], nullable: true),
        new OA\Property(property: 'direction', type: 'string', enum: ['asc', 'desc'], nullable: true),
        new OA\Property(property: 'per_page', type: 'integer', minimum: 1, maximum: 100, nullable: true),
        new OA\Property(property: 'page', type: 'integer', minimum: 1, nullable: true),
    ]
)]
class IndexCommentRequest extends FormRequest
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
            'status' => ['nullable', Rule::enum(CommentStatus::class)],
            'post_id' => ['nullable', 'uuid'],
            'sort' => ['nullable', Rule::in(['created_at', 'updated_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
