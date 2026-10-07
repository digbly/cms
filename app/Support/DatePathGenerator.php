<?php

namespace App\Support;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\PathGenerator;

/**
 * Store media inside year/month/day folders (WordPress style), keeping a
 * unique folder per media so files with identical names never collide.
 */
class DatePathGenerator implements PathGenerator
{
    public function getPath(Media $media): string
    {
        return $this->basePath($media).'/';
    }

    public function getPathForConversions(Media $media): string
    {
        return $this->basePath($media).'/conversions/';
    }

    public function getPathForResponsiveImages(Media $media): string
    {
        return $this->basePath($media).'/responsive-images/';
    }

    protected function basePath(Media $media): string
    {
        $date = $media->created_at ?? now();

        return $date->format('Y/m/d').'/'.$media->getKey();
    }
}
