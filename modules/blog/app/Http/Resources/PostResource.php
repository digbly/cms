<?php

namespace Modules\Blog\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Blog\Models\Post;
use OpenApi\Attributes as OA;

/**
 * @property-read Post $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'title', 'slug', 'status'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'title', type: 'string', nullable: true, example: 'Hello world'),
        new OA\Property(property: 'slug', type: 'string', nullable: true, example: 'hello-world'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'content', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', enum: ['draft', 'published']),
        new OA\Property(property: 'status_label', type: 'string', example: 'Published'),
        new OA\Property(property: 'views', type: 'integer', example: 0),
        new OA\Property(property: 'user_id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(property: 'author', type: AuthorResource::class, nullable: true),
        new OA\Property(
            property: 'categories',
            type: 'array',
            items: new OA\Items(type: CategoryResource::class)
        ),
        new OA\Property(
            property: 'translations',
            type: 'array',
            items: new OA\Items(type: PostTranslationResource::class)
        ),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
class PostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $translation = $this->resource->resolvedTranslation();

        return [
            'id' => $this->resource->id,
            'title' => $translation?->title,
            'slug' => $translation?->slug,
            'description' => $translation?->description,
            'content' => $translation?->content,
            'status' => $this->resource->status?->value,
            'status_label' => $this->resource->status?->label(),
            'views' => $this->resource->views,
            'user_id' => $this->resource->user_id,
            'author' => $this->whenLoaded(
                'author',
                fn () => $this->resource->author ? AuthorResource::make($this->resource->author) : null
            ),
            'categories' => $this->whenLoaded(
                'categories',
                fn () => CategoryResource::collection($this->categories)->resolve()
            ),
            'translations' => $this->whenLoaded(
                'translations',
                fn () => PostTranslationResource::collection($this->translations)->resolve()
            ),
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
        ];
    }
}
