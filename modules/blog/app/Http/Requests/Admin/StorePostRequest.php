<?php

namespace Modules\Blog\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Blog\Enums\PostStatus;
use Modules\Blog\Http\Requests\Admin\Concerns\ValidatesTranslations;
use Modules\Blog\Models\PostTranslation;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['status', 'translations'],
    properties: [
        new OA\Property(property: 'status', type: 'string', enum: ['draft', 'published']),
        new OA\Property(property: 'user_id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(
            property: 'categories',
            type: 'array',
            items: new OA\Items(type: 'string', format: 'uuid')
        ),
        new OA\Property(
            property: 'translations',
            type: 'array',
            items: new OA\Items(
                required: ['locale', 'title', 'slug'],
                properties: [
                    new OA\Property(property: 'locale', type: 'string', example: 'en'),
                    new OA\Property(property: 'title', type: 'string', example: 'Hello world'),
                    new OA\Property(property: 'slug', type: 'string', example: 'hello-world'),
                    new OA\Property(property: 'description', type: 'string', nullable: true),
                    new OA\Property(property: 'content', type: 'string', nullable: true),
                ]
            )
        ),
    ]
)]
class StorePostRequest extends FormRequest
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
        return [
            'status' => ['required', Rule::enum(PostStatus::class)],
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'categories' => ['nullable', 'array'],
            'categories.*' => Rule::exists('post_categories', 'id'),
            'translations' => ['required', 'array', 'min:1'],
            'translations.*.locale' => ['required', 'string', 'max:5', 'distinct'],
            'translations.*.title' => ['required', 'string', 'max:255'],
            'translations.*.slug' => ['required', 'string', 'max:190', 'distinct', $this->uniqueSlugRule(PostTranslation::class, 'post_id')],
            'translations.*.description' => ['nullable', 'string'],
            'translations.*.content' => ['nullable', 'string'],
        ];
    }
}
