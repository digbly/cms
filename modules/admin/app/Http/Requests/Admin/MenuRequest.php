<?php

namespace Modules\Admin\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['name'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 100, example: 'Main Menu'),
        new OA\Property(
            property: 'content',
            description: 'JSON tree of menu items. Required when updating.',
            type: 'string',
            nullable: true
        ),
        new OA\Property(property: 'locale', type: 'string', maxLength: 10, nullable: true, example: 'en'),
        new OA\Property(
            property: 'location',
            description: 'Theme locations the menu is assigned to.',
            type: 'array',
            nullable: true,
            items: new OA\Items(type: 'string')
        ),
    ]
)]
class MenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'content' => [
                Rule::requiredIf($this->isMethod('put') || $this->isMethod('patch')),
                'json',
            ],
            'locale' => ['nullable', 'string', 'max:10'],
            'location' => ['nullable', 'array'],
            'location.*' => ['string'],
        ];
    }
}
