<?php

namespace Modules\Admin\Enums;

enum ThemePermission: string
{
    case View = 'themes.view';
    case Update = 'themes.update';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
