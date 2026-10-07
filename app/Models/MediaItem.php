<?php

namespace App\Models;

use Database\Factories\MediaItemFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Auth\Models\User;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaItem extends Model implements HasMedia
{
    use HasFactory, HasUuids, InteractsWithMedia;

    protected $table = 'media_items';

    protected $fillable = [
        'title',
        'alt',
        'caption',
        'description',
        'uploaded_by',
    ];

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('default')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit(Fit::Max, 400, 400)
            ->nonQueued();

        $this->addMediaConversion('medium')
            ->fit(Fit::Max, 1024, 1024)
            ->nonQueued();
    }

    protected static function newFactory(): MediaItemFactory
    {
        return MediaItemFactory::new();
    }

    /**
     * Persist the pixel dimensions of an image file for the media library.
     */
    public static function storeDimensions(Media $media): void
    {
        if (! str_starts_with((string) $media->mime_type, 'image/') || $media->mime_type === 'image/svg+xml') {
            return;
        }

        $path = $media->getPath();

        if (! is_file($path)) {
            return;
        }

        $size = @getimagesize($path);

        if ($size === false) {
            return;
        }

        $media->setCustomProperty('width', $size[0]);
        $media->setCustomProperty('height', $size[1]);
        $media->save();
    }
}
