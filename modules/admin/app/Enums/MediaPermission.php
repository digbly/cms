<?php

namespace Modules\Admin\Enums;

enum MediaPermission: string
{
    case MediaView = 'media.view';
    case MediaCreate = 'media.create';
    case MediaUpdate = 'media.update';
    case MediaDelete = 'media.delete';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $permission): string => $permission->value,
            self::cases()
        );
    }
}
