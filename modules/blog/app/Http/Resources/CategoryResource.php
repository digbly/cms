<?php

namespace Modules\Blog\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Blog\Models\Category;
use OpenApi\Attributes as OA;

/**
 * @property-read Category $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'name', 'slug'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'name', type: 'string', nullable: true, example: 'News'),
        new OA\Property(property: 'slug', type: 'string', nullable: true, example: 'news'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'parent_id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(property: 'is_home', type: 'boolean', example: false),
        new OA\Property(property: 'posts_count', type: 'integer', nullable: true),
        new OA\Property(
            property: 'translations',
            type: 'array',
            items: new OA\Items(type: CategoryTranslationResource::class)
        ),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
class CategoryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $translation = $this->resource->resolvedTranslation();

        return [
            'id' => $this->resource->id,
            'name' => $translation?->name,
            'slug' => $translation?->slug,
            'description' => $translation?->description,
            'parent_id' => $this->resource->parent_id,
            'is_home' => (bool) $this->resource->is_home,
            'posts_count' => $this->whenCounted('posts'),
            'translations' => $this->whenLoaded(
                'translations',
                fn () => CategoryTranslationResource::collection($this->translations)->resolve()
            ),
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
        ];
    }
}
