<?php

namespace App\Models\Menus;

use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MenuItem extends Model implements TranslatableContract
{
    use HasUuids, Translatable;

    public $timestamps = false;

    protected $table = 'menu_items';

    protected $fillable = [
        'menu_id',
        'parent_id',
        'menuable_type',
        'menuable_id',
        'link',
        'icon',
        'target',
        'display_order',
        'box_key',
        'is_home',
    ];

    public array $translatedAttributes = [
        'label',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class, 'menu_id', 'id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id', 'id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id', 'id')->orderBy('display_order');
    }

    public function menuable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeWhereRoot(Builder $builder): Builder
    {
        return $builder->whereNull('parent_id');
    }

    public function scopeWithAllChildren(Builder $builder, array $with = []): Builder
    {
        return $builder->with([
            'children' => function ($query) use ($with) {
                $query->with($with)
                    ->with('translations')
                    ->withAllChildren($with)
                    ->orderBy('display_order');
            },
        ]);
    }

    public function getMenuableClassNameAttribute(): ?string
    {
        if (empty($this->menuable_type)) {
            return null;
        }

        return class_basename($this->menuable_type);
    }

    public function getIsCustomAttribute(): bool
    {
        return empty($this->menuable_type) && empty($this->menuable_id);
    }

    public function getUrl(): ?string
    {
        if ($this->is_custom) {
            return $this->link;
        }

        if (! class_exists($this->menuable_type) || ! $this->menuable) {
            return null;
        }

        if (! method_exists($this->menuable, 'getUrl')) {
            return null;
        }

        return $this->menuable->getUrl();
    }
}
