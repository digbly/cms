<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Fills and scopes models by the currently active theme.
 */
trait HasThemeField
{
    public static function bootHasThemeField(): void
    {
        static::creating(function ($model): void {
            if (empty($model->theme)) {
                $model->theme = theme_name();
            }
        });

        static::addGlobalScope('theme', function (Builder $builder): void {
            $builder->where(
                $builder->getModel()->getTable().'.theme',
                theme_name()
            );
        });
    }
}
