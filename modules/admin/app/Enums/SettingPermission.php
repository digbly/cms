<?php

namespace Modules\Admin\Enums;

enum SettingPermission: string
{
    case Manage = 'settings.manage';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
