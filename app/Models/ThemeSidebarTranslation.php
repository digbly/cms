<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThemeSidebarTranslation extends Model
{
    protected $table = 'theme_sidebar_translations';

    protected $fillable = [
        'locale',
        'label',
        'fields',
        'theme_sidebar_id',
    ];

    protected $casts = [
        'fields' => 'array',
    ];

    public function sidebar(): BelongsTo
    {
        return $this->belongsTo(ThemeSidebar::class, 'theme_sidebar_id');
    }
}
