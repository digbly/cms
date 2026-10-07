<?php

namespace Modules\Blog\Models;

use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Blog\Database\Factories\CategoryFactory;

class Category extends Model implements TranslatableContract
{
    use HasFactory, HasUuids, Translatable;

    protected $table = 'post_categories';

    protected $translationForeignKey = 'post_category_id';

    protected $fillable = [
        'parent_id',
        'is_home',
    ];

    protected $casts = [
        'is_home' => 'boolean',
    ];

    public array $translatedAttributes = [
        'name',
        'description',
        'slug',
    ];

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->with('children');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(
            Post::class,
            'post_category',
            'post_category_id',
            'post_id'
        );
    }

    /**
     * Resolve the translation matching the current locale, falling back to the
     * first available translation when the requested locale is missing.
     */
    public function resolvedTranslation(?string $locale = null): ?CategoryTranslation
    {
        $translations = $this->relationLoaded('translations')
            ? $this->translations
            : $this->translations()->get();

        $locale ??= app()->getLocale();

        return $translations->firstWhere('locale', $locale)
            ?? $translations->first();
    }

    protected static function newFactory(): CategoryFactory
    {
        return CategoryFactory::new();
    }
}
