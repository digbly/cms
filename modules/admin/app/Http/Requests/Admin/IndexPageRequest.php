<?php

namespace Modules\Admin\Http\Requests\Admin;

use App\Enums\PageStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    properties: [
        new OA\Property(property: 'search', type: 'string', nullable: true, example: 'about'),
        new OA\Property(property: 'status', type: 'string', enum: ['published', 'draft'], nullable: true),
        new OA\Property(property: 'per_page', type: 'integer', minimum: 1, maximum: 100, nullable: true),
        new OA\Property(property: 'page', type: 'integer', minimum: 1, nullable: true),
    ]
)]
class IndexPageRequest extends FormRequest
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
            'status' => ['nullable', Rule::enum(PageStatus::class)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
