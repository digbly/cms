<?php

namespace App\Models\Pages;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageTranslation extends Model
{
    protected $table = 'page_translations';

    protected $fillable = [
        'title',
        'slug',
        'content',
        'description',
        'locale',
        'page_id',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id', 'id');
    }
}
