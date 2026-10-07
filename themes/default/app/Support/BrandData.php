<?php

namespace Themes\Default\Support;

use App\Facades\Setting;
use App\Models\MediaItem;

/**
 * Resolves the site brand (name and logo) from the application settings.
 */
class BrandData
{
    /**
     * The configured site name, falling back to the translatable title and the
     * application name.
     */
    public function name(): string
    {
        $name = Setting::get('sitename') ?: Setting::get('title');

        return (string) ($name ?: config('app.name'));
    }

    /**
     * The public URL of the configured logo media, when one is set.
     */
    public function logoUrl(): ?string
    {
        $id = Setting::get('logo');

        if (! is_string($id) || $id === '') {
            return null;
        }

        return MediaItem::query()->find($id)?->getFirstMedia()?->getUrl();
    }
}
