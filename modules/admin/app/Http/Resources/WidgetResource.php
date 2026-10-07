<?php

namespace Modules\Admin\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read array{key: string, label: string, description: ?string, only: array<int, string>} $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['key', 'label'],
    properties: [
        new OA\Property(property: 'key', type: 'string', example: 'recent-posts'),
        new OA\Property(property: 'label', type: 'string', example: 'Recent posts'),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(
            property: 'only',
            description: 'Sidebar keys the widget may be attached to. Empty means any.',
            type: 'array',
            items: new OA\Items(type: 'string')
        ),
    ]
)]
class WidgetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->resource['key'],
            'label' => $this->resource['label'],
            'description' => $this->resource['description'] ?? null,
            'only' => array_values($this->resource['only'] ?? []),
        ];
    }
}
