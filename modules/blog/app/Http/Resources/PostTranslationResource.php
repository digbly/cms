<?php

namespace Modules\Blog\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Blog\Models\PostTranslation;
use OpenApi\Attributes as OA;

/**
 * @property-read PostTranslation $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'locale', 'title', 'slug'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'locale', type: 'string', example: 'en'),
        new OA\Property(property: 'title', type: 'string', example: 'Hello world'),
        new OA\Property(property: 'slug', type: 'string', example: 'hello-world'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'content', type: 'string', nullable: true),
    ]
)]
class PostTranslationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'locale' => $this->resource->locale,
            'title' => $this->resource->title,
            'slug' => $this->resource->slug,
            'description' => $this->resource->description,
            'content' => $this->resource->content,
        ];
    }
}
