<?php

namespace Modules\Admin\Enums;

enum WidgetPermission: string
{
    case View = 'widgets.view';
    case Update = 'widgets.update';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $case) => $case->value, self::cases());
    }
}
