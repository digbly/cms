<?php

namespace App\Models\Menus;

use Database\Factories\Menus\MenuFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'menus';

    protected $fillable = [
        'name',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'menu_id', 'id');
    }

    public function scopeWithDataItems(Builder $builder): Builder
    {
        return $builder->with([
            'items' => fn ($query) => $query
                ->with('translations')
                ->with('menuable')
                ->whereRoot()
                ->withAllChildren(['menuable']),
        ]);
    }

    protected static function newFactory(): MenuFactory
    {
        return MenuFactory::new();
    }
}
