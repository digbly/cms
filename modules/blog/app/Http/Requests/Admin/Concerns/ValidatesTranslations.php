<?php

namespace Modules\Blog\Http\Requests\Admin\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Model;

trait ValidatesTranslations
{
    /**
     * Reject duplicate translation slugs, ignoring the translations of the
     * record being updated.
     *
     * @param  class-string<Model>  $translationModel
     */
    protected function uniqueSlugRule(
        string $translationModel,
        string $foreignKey,
        ?string $ignoreId = null
    ): Closure {
        return function (string $attribute, mixed $value, Closure $fail) use (
            $translationModel,
            $foreignKey,
            $ignoreId
        ): void {
            $query = $translationModel::query()->where('slug', $value);

            if ($ignoreId !== null) {
                $query->where($foreignKey, '!=', $ignoreId);
            }

            if ($query->exists()) {
                $fail('The slug has already been taken.');
            }
        };
    }
}
