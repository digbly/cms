<?php

namespace Modules\Blog\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryTranslation extends Model
{
    protected $table = 'post_category_translations';

    protected $fillable = [
        'name',
        'description',
        'slug',
        'locale',
        'post_category_id',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'post_category_id');
    }
}
