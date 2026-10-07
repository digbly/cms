<?php

namespace App\Models\Pages;

use App\Traits\HasThemeField;
use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageBlock extends Model implements TranslatableContract
{
    use HasThemeField, HasUuids, Translatable;

    protected $table = 'page_blocks';

    protected $fillable = [
        'page_id',
        'block',
        'data',
        'theme',
        'container',
        'display_order',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public array $translatedAttributes = [
        'label',
        'fields',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class, 'page_id', 'id');
    }
}
