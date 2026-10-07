<?php

namespace Modules\Admin\Enums;

enum LanguagePermission: string
{
    case View = 'languages.view';
    case Create = 'languages.create';
    case Update = 'languages.update';
    case Delete = 'languages.delete';

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
