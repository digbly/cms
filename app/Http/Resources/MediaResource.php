<?php

namespace App\Http\Resources;

use App\Models\MediaItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use OpenApi\Attributes as OA;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * @property-read MediaItem $resource
 */
#[OA\Schema(
    schema: __CLASS__,
    required: ['id', 'url'],
    properties: [
        new OA\Property(property: 'id', type: 'string', format: 'uuid'),
        new OA\Property(property: 'title', type: 'string', nullable: true),
        new OA\Property(property: 'alt', type: 'string', nullable: true),
        new OA\Property(property: 'caption', type: 'string', nullable: true),
        new OA\Property(property: 'description', type: 'string', nullable: true),
        new OA\Property(property: 'name', type: 'string', nullable: true),
        new OA\Property(property: 'file_name', type: 'string', nullable: true),
        new OA\Property(property: 'mime_type', type: 'string', nullable: true),
        new OA\Property(property: 'extension', type: 'string', nullable: true),
        new OA\Property(property: 'size', type: 'integer', nullable: true),
        new OA\Property(property: 'size_formatted', type: 'string', nullable: true),
        new OA\Property(property: 'url', type: 'string', nullable: true),
        new OA\Property(property: 'thumb_url', type: 'string', nullable: true),
        new OA\Property(property: 'medium_url', type: 'string', nullable: true),
        new OA\Property(property: 'width', type: 'integer', nullable: true),
        new OA\Property(property: 'height', type: 'integer', nullable: true),
        new OA\Property(property: 'is_image', type: 'boolean'),
        new OA\Property(property: 'created_at', type: 'string', format: 'date-time', nullable: true),
        new OA\Property(property: 'updated_at', type: 'string', format: 'date-time', nullable: true),
    ]
)]
class MediaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $media = $this->resource->getFirstMedia();
        $isImage = $media !== null && str_starts_with((string) $media->mime_type, 'image/');

        return [
            'id' => $this->resource->id,
            'title' => $this->resource->title ?? $media?->name,
            'alt' => $this->resource->alt,
            'caption' => $this->resource->caption,
            'description' => $this->resource->description,
            'name' => $media?->name,
            'file_name' => $media?->file_name,
            'mime_type' => $media?->mime_type,
            'extension' => $media?->extension,
            'size' => $media?->size,
            'size_formatted' => $this->formatSize($media?->size),
            'url' => $media?->getUrl(),
            'thumb_url' => $this->conversionUrl($media, 'thumb'),
            'medium_url' => $this->conversionUrl($media, 'medium'),
            'width' => $isImage ? $media?->getCustomProperty('width') : null,
            'height' => $isImage ? $media?->getCustomProperty('height') : null,
            'is_image' => $isImage,
            'created_at' => $this->resource->created_at,
            'updated_at' => $this->resource->updated_at,
        ];
    }

    protected function conversionUrl(?Media $media, string $conversion): ?string
    {
        if ($media === null || ! str_starts_with((string) $media->mime_type, 'image/')) {
            return null;
        }

        if ($media->hasGeneratedConversion($conversion)) {
            return $media->getUrl($conversion);
        }

        return $media->getUrl();
    }

    /**
     * Human readable file size without depending on the intl extension.
     */
    protected function formatSize(?int $bytes): ?string
    {
        if ($bytes === null) {
            return null;
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $power = $bytes > 0 ? (int) floor(log($bytes, 1024)) : 0;
        $power = min($power, count($units) - 1);

        return round($bytes / (1024 ** $power), $power > 0 ? 2 : 0).' '.$units[$power];
    }
}
