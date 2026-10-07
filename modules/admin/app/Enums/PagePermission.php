<?php

namespace Modules\Admin\Enums;

enum PagePermission: string
{
    case View = 'pages.view';
    case Create = 'pages.create';
    case Update = 'pages.update';
    case Delete = 'pages.delete';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
