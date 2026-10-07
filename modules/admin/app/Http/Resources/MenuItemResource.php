<?php

namespace Modules\Admin\Http\Resources;

use App\Models\Menus\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;

/**
 * @property-read MenuItem $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'target', 'is_custom', 'box_key', 'display_order'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'label', type: 'string', nullable: true),
        new OA\Property(property: 'link', type: 'string', nullable: true),
        new OA\Property(property: 'target', type: 'string', example: '_self'),
        new OA\Property(property: 'is_custom', type: 'boolean'),
        new OA\Property(property: 'box_key', type: 'string'),
        new OA\Property(property: 'menuable_type', type: 'string', nullable: true),
        new OA\Property(property: 'menuable_id', type: 'string', nullable: true),
        new OA\Property(property: 'menuable_class_name', type: 'string', nullable: true),
        new OA\Property(property: 'display_order', type: 'integer'),
        new OA\Property(
            property: 'children',
            type: 'array',
            items: new OA\Items(type: self::class)
        ),
    ]
)]
class MenuItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'link' => $this->link,
            'target' => $this->target,
            'is_custom' => $this->is_custom,
            'box_key' => $this->box_key,
            'menuable_type' => $this->menuable_type,
            'menuable_id' => $this->menuable_id,
            'menuable_class_name' => $this->menuable_class_name,
            'display_order' => $this->display_order,
            'children' => $this->whenLoaded(
                'children',
                fn () => MenuItemResource::collection($this->children)->resolve()
            ),
        ];
    }
}
