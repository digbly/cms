<?php

namespace Modules\Blog\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Auth\Models\User;
use OpenApi\Attributes as OA;

/**
 * Lightweight author representation for blog posts, safe to expose on the
 * public API (no roles or permissions).
 *
 * @property-read User $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'name'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'name', type: 'string', nullable: true),
    ]
)]
class AuthorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
        ];
    }
}
