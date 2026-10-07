<?php

namespace App\Enums;

use Illuminate\Support\Str;

enum PageStatus: string
{
    case Published = 'published';
    case Draft = 'draft';

    /**
     * @return array<string, string>
     */
    public static function all(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $case) => [$case->value => $case->label()])
            ->toArray();
    }

    public function label(): string
    {
        return Str::headline($this->name);
    }
}
