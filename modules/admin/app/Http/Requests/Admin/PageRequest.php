<?php

namespace Modules\Admin\Http\Requests\Admin;

use App\Enums\PageStatus;
use App\Models\Pages\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['title', 'slug'],
    properties: [
        new OA\Property(property: 'title', type: 'string', example: 'About us'),
        new OA\Property(property: 'slug', type: 'string', example: 'about-us'),
        new OA\Property(property: 'content', type: 'string', nullable: true),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', enum: ['published', 'draft'], example: 'published'),
        new OA\Property(property: 'template', type: 'string', nullable: true, example: 'landing'),
        new OA\Property(property: 'locale', type: 'string', nullable: true, example: 'en'),
    ]
)]
class PageRequest extends FormRequest
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
        /** @var Page|null $page */
        $page = $this->route('page');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:190',
                Rule::unique('page_translations', 'slug')
                    ->when($page !== null, fn ($rule) => $rule->whereNot('page_id', $page->id)),
            ],
            'content' => ['nullable', 'string'],
            'description' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', Rule::enum(PageStatus::class)],
            'template' => ['nullable', 'string', 'max:100'],
            'locale' => ['nullable', 'string', 'max:10'],
        ];
    }
}
