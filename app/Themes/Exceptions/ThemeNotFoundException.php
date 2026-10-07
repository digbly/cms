<?php

namespace App\Themes\Exceptions;

use RuntimeException;

class ThemeNotFoundException extends RuntimeException
{
    public static function make(string $name): self
    {
        return new self("Theme [{$name}] does not exist!");
    }
}
