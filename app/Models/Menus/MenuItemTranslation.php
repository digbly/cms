<?php

namespace App\Models\Menus;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItemTranslation extends Model
{
    public $timestamps = false;

    protected $table = 'menu_item_translations';

    protected $fillable = [
        'label',
        'locale',
        'menu_item_id',
    ];

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class, 'menu_item_id', 'id');
    }
}
