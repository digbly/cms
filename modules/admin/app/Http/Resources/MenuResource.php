<?php

namespace Modules\Admin\Http\Resources;

use App\Models\Menus\Menu;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read Menu $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'name'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'name', type: 'string', example: 'Main Menu'),
        new OA\Property(
            property: 'items',
            type: 'array',
            items: new OA\Items(type: MenuItemResource::class)
        ),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
class MenuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'items' => $this->whenLoaded(
                'items',
                fn () => MenuItemResource::collection($this->items)->resolve()
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
