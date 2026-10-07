<?php

namespace App\Models\Pages;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageBlockTranslation extends Model
{
    protected $table = 'page_block_translations';

    protected $fillable = [
        'page_block_id',
        'locale',
        'label',
        'fields',
    ];

    protected $casts = [
        'fields' => 'array',
    ];

    public function block(): BelongsTo
    {
        return $this->belongsTo(PageBlock::class, 'page_block_id');
    }
}
