<?php

namespace Modules\Blog\Http\Requests\Admin;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Blog\Http\Requests\Admin\Concerns\ValidatesTranslations;
use Modules\Blog\Models\Category;
use Modules\Blog\Models\CategoryTranslation;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
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
class UpdateCategoryRequest extends FormRequest
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
        $category = $this->route('category');
        $ignoreId = $category instanceof Category ? $category->getKey() : null;

        $parent = Rule::exists('post_categories', 'id');
        if ($ignoreId !== null) {
            $parent->where('id', '!=', $ignoreId);
        }

        return [
            'parent_id' => ['nullable', 'uuid', $parent, $this->parentDoesNotCreateCycle($ignoreId)],
            'is_home' => ['sometimes', 'boolean'],
            'translations' => ['sometimes', 'array', 'min:1'],
            'translations.*.locale' => ['required', 'string', 'max:5', 'distinct'],
            'translations.*.name' => ['required', 'string', 'max:255'],
            'translations.*.slug' => ['required', 'string', 'max:190', 'distinct', $this->uniqueSlugRule(CategoryTranslation::class, 'post_category_id', $ignoreId)],
            'translations.*.description' => ['nullable', 'string'],
        ];
    }

    /**
     * Walk up the ancestor chain from the chosen parent; if the category being
     * updated appears in it, the assignment would create a cycle.
     */
    protected function parentDoesNotCreateCycle(?string $ignoreId): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($ignoreId): void {
            if ($ignoreId === null || $value === null) {
                return;
            }

            $cursor = $value;
            $visited = [];

            while ($cursor !== null) {
                if ($cursor === $ignoreId) {
                    $fail('A category cannot be nested under one of its own descendants.');

                    return;
                }

                if (isset($visited[$cursor])) {
                    return;
                }

                $visited[$cursor] = true;
                $cursor = Category::query()->whereKey($cursor)->value('parent_id');
            }
        };
    }
}
