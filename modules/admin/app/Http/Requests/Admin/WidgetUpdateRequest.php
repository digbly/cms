<?php

namespace Modules\Admin\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['content'],
    properties: [
        new OA\Property(property: 'locale', type: 'string', maxLength: 10, nullable: true, example: 'en'),
        new OA\Property(
            property: 'content',
            description: 'Ordered list of widgets attached to the sidebar.',
            type: 'array',
            items: new OA\Items(
                properties: [
                    new OA\Property(property: 'id', type: 'string', format: 'uuid', nullable: true),
                    new OA\Property(property: 'widget', type: 'string', example: 'recent-posts'),
                    new OA\Property(property: 'label', type: 'string', nullable: true),
                    new OA\Property(property: 'data', type: 'object', additionalProperties: true, nullable: true),
                ],
                type: 'object'
            )
        ),
    ]
)]
class WidgetUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'locale' => ['nullable', 'string', 'max:10'],
            'content' => ['array'],
            'content.*.id' => ['nullable', 'string'],
            'content.*.widget' => ['required', 'string', 'max:100'],
            'content.*.label' => ['nullable', 'string', 'max:190'],
            'content.*.data' => ['nullable', 'array'],
        ];
    }
}
