<?php

namespace Modules\Admin\Enums;

enum MenuPermission: string
{
    case View = 'menus.view';
    case Create = 'menus.create';
    case Update = 'menus.update';
    case Delete = 'menus.delete';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
