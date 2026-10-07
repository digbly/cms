<?php

namespace Modules\Admin\Http\Resources;

use App\Models\Pages\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read Page $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'title', 'slug'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'title', type: 'string'),
        new OA\Property(property: 'slug', type: 'string'),
        new OA\Property(property: 'content', type: 'string', nullable: true),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'status', type: 'string', example: 'published'),
        new OA\Property(property: 'template', type: 'string', nullable: true),
        new OA\Property(property: 'blocks', type: 'object', additionalProperties: true),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
    ]
)]
class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'title' => $this->resource->title,
            'slug' => $this->resource->slug,
            'content' => $this->resource->content,
            'description' => $this->resource->description,
            'status' => $this->resource->status?->value,
            'template' => $this->resource->template,
            'created_at' => $this->resource->created_at?->toIso8601String(),
        ];
    }
}
