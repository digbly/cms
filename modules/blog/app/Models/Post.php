<?php

namespace Modules\Blog\Models;

use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Modules\Auth\Models\User;
use Modules\Blog\Database\Factories\PostFactory;
use Modules\Blog\Enums\PostStatus;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Post extends Model implements HasMedia, TranslatableContract
{
    use HasFactory, HasUuids, InteractsWithMedia, Translatable;

    protected $table = 'posts';

    protected $fillable = [
        'status',
        'user_id',
    ];

    protected $casts = [
        'status' => PostStatus::class,
    ];

    public array $translatedAttributes = [
        'title',
        'description',
        'content',
        'slug',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(
            Category::class,
            'post_category',
            'post_id',
            'post_category_id'
        );
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'post_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('thumb')->singleFile();
    }

    public function thumbUrl(): ?string
    {
        return $this->getFirstMediaUrl('thumb') ?: null;
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', PostStatus::Published);
    }

    /**
     * Resolve the translation matching the current locale, falling back to the
     * first available translation when the requested locale is missing.
     */
    public function resolvedTranslation(?string $locale = null): ?PostTranslation
    {
        $translations = $this->relationLoaded('translations')
            ? $this->translations
            : $this->translations()->get();

        $locale ??= app()->getLocale();

        return $translations->firstWhere('locale', $locale)
            ?? $translations->first();
    }

    protected static function newFactory(): PostFactory
    {
        return PostFactory::new();
    }
}
