<?php

namespace Modules\Blog\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Blog\Models\CategoryTranslation;
use OpenApi\Attributes as OA;

/**
 * @property-read CategoryTranslation $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'locale', 'name', 'slug'],
    properties: [
        new OA\Property(property: 'id', type: 'integer', example: 1),
        new OA\Property(property: 'locale', type: 'string', example: 'en'),
        new OA\Property(property: 'name', type: 'string', example: 'News'),
        new OA\Property(property: 'slug', type: 'string', example: 'news'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
    ]
)]
class CategoryTranslationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'locale' => $this->resource->locale,
            'name' => $this->resource->name,
            'slug' => $this->resource->slug,
            'description' => $this->resource->description,
        ];
    }
}
