<?php

namespace Modules\Admin\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Modules\Auth\Models\User;
use OpenApi\Attributes as OA;

/**
 * @property-read User $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'name', 'email', 'permissions', 'created_at', 'updated_at'],
    properties: [
        new OA\Property(
            property: 'id',
            type: 'string',
            format: 'uuid',
            example: '9c3c6f1a-6df7-4b1e-b8eb-9d8e6c7d9a10'
        ),
        new OA\Property(
            property: 'name',
            type: 'string',
            example: 'John Doe'
        ),
        new OA\Property(
            property: 'email',
            type: 'string',
            format: 'email',
            example: 'john@example.com'
        ),
        new OA\Property(
            property: 'avatar',
            type: 'string',
            nullable: true,
            example: 'http://localhost:8000/storage/1/avatar.jpg'
        ),
        new OA\Property(
            property: 'roles',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['admin']
        ),
        new OA\Property(
            property: 'is_super_admin',
            type: 'boolean',
            example: false
        ),
        new OA\Property(
            property: 'permissions',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['dashboard.view']
        ),
        new OA\Property(
            property: 'email_verified_at',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: '2026-08-16T09:00:00.000000Z'
        ),
        new OA\Property(
            property: 'deleted_at',
            type: 'string',
            format: 'date-time',
            nullable: true,
            example: null
        ),
        new OA\Property(
            property: 'created_at',
            type: 'string',
            format: 'date-time',
            example: '2026-08-16T09:00:00.000000Z'
        ),
        new OA\Property(
            property: 'updated_at',
            type: 'string',
            format: 'date-time',
            example: '2026-08-16T09:00:00.000000Z'
        ),
    ]
)]
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'email' => $this->resource->email,
            'avatar' => $this->resource->avatarUrl(),
            'roles' => $this->resource->getRoleNames()->values()->all(),
            'is_super_admin' => $this->resource->isSuperAdmin(),
            'permissions' => $this->resource->permissionNames(),
            'email_verified_at' => $this->resource->email_verified_at?->toISOString(),
            'deleted_at' => $this->resource->deleted_at?->toISOString(),
            'created_at' => $this->resource->created_at?->toISOString(),
            'updated_at' => $this->resource->updated_at?->toISOString(),
        ];
    }
}
