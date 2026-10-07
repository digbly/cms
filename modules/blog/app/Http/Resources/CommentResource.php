<?php

namespace Modules\Blog\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Blog\Models\Comment;
use OpenApi\Attributes as OA;

/**
 * @property-read Comment $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'post_id', 'content', 'status'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'post_id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'parent_id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(property: 'user_id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(property: 'name', type: 'string', nullable: true, example: 'John Doe'),
        new OA\Property(property: 'content', type: 'string'),
        new OA\Property(property: 'status', type: 'string', enum: ['pending', 'approved', 'spam', 'rejected']),
        new OA\Property(property: 'status_label', type: 'string', example: 'Approved'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
class CommentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'post_id' => $this->resource->post_id,
            'parent_id' => $this->resource->parent_id,
            'user_id' => $this->resource->user_id,
            'name' => $this->resource->author_name,
            'content' => $this->resource->content,
            'status' => $this->resource->status?->value,
            'status_label' => $this->resource->status?->label(),
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
        ];
    }
}
