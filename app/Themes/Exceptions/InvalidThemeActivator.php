<?php

namespace App\Themes\Exceptions;

use RuntimeException;

class InvalidThemeActivator extends RuntimeException
{
    public static function missingConfig(): self
    {
        return new self(
            "You don't have a valid theme activator configuration class. ".
            "Check the 'activator' and 'activators' keys in config/themes.php."
        );
    }
}
