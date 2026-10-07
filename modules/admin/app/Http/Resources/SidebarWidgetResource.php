<?php

namespace Modules\Admin\Http\Resources;

use App\Contracts\Widget as WidgetContract;
use App\Models\ThemeSidebar;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read ThemeSidebar $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'widget', 'label'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid', nullable: true),
        new OA\Property(property: 'widget', type: 'string', example: 'recent-posts'),
        new OA\Property(property: 'label', type: 'string', example: 'Recent posts'),
        new OA\Property(property: 'data', type: 'object', additionalProperties: true),
    ]
)]
class SidebarWidgetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $widget = app(WidgetContract::class)->get((string) $this->resource->widget);

        return [
            'id' => $this->resource->id,
            'widget' => $this->resource->widget,
            'label' => $this->resource->label ?: ($widget?->label ?? $this->resource->widget),
            'data' => $this->resource->data ?? [],
        ];
    }
}
