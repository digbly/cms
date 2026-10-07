<?php

namespace Modules\Blog\Http\Controllers\Concerns;

use App\Support\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;

trait SyncsTranslations
{
    /**
     * Upsert the submitted translations by locale and drop the locales that are
     * no longer present in the payload.
     *
     * Rich-text `content` is sanitized against an allowlist before storage so
     * stored markup cannot execute scripts when rendered by the theme.
     *
     * @param  array<int, array<string, mixed>>  $translations
     */
    protected function syncTranslations(Model $model, array $translations): void
    {
        $sanitizer = app(HtmlSanitizer::class);
        $locales = [];

        foreach ($translations as $translation) {
            $locales[] = $translation['locale'];

            if (isset($translation['content']) && is_string($translation['content'])) {
                $translation['content'] = $sanitizer->sanitize($translation['content']);
            }

            $model->translations()->updateOrCreate(
                ['locale' => $translation['locale']],
                $translation
            );
        }

        $model->translations()->whereNotIn('locale', $locales)->delete();
    }
}
