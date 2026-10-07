<?php

namespace Modules\Admin\Support;

use App\Http\Resources\MediaResource;
use App\Models\MediaItem;

/**
 * Resolve media ids into serialisable previews for forms that render a
 * MediaField (settings branding, customizer site identity, ...).
 */
class MediaPreviewResolver
{
    /**
     * @param  array<int, string|null>  $ids
     * @return array<string, array<string, mixed>>
     */
    public function byId(array $ids): array
    {
        $ids = array_values(array_filter($ids));

        if ($ids === []) {
            return [];
        }

        return MediaItem::query()
            ->with('media')
            ->whereIn('id', $ids)
            ->get()
            ->mapWithKeys(fn (MediaItem $item) => [$item->id => MediaResource::make($item)->resolve()])
            ->all();
    }
}
