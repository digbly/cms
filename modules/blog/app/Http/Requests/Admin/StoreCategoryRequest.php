<?php

namespace Modules\Blog\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Blog\Http\Requests\Admin\Concerns\ValidatesTranslations;
use Modules\Blog\Models\CategoryTranslation;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['translations'],
    properties: [
        new OA\Property(property: 'parent_id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(property: 'is_home', type: 'boolean', example: false),
        new OA\Property(
            property: 'translations',
            type: 'array',
            items: new OA\Items(
                required: ['locale', 'name', 'slug'],
                properties: [
                    new OA\Property(property: 'locale', type: 'string', example: 'en'),
                    new OA\Property(property: 'name', type: 'string', example: 'News'),
                    new OA\Property(property: 'slug', type: 'string', example: 'news'),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                ]
            )
        ),
    ]
)]
class StoreCategoryRequest extends FormRequest
{
    use ValidatesTranslations;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $parent = Rule::exists('post_categories', 'id');

        return [
            'parent_id' => ['nullable', 'uuid', $parent],
            'is_home' => ['sometimes', 'boolean'],
            'translations' => ['required', 'array', 'min:1'],
            'translations.*.locale' => ['required', 'string', 'max:5', 'distinct'],
            'translations.*.name' => ['required', 'string', 'max:255'],
            'translations.*.slug' => ['required', 'string', 'max:190', 'distinct', $this->uniqueSlugRule(CategoryTranslation::class, 'post_category_id')],
            'translations.*.description' => ['nullable', 'string'],
        ];
    }
}
