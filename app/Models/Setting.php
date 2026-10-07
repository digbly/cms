<?php

namespace App\Models;

use Astrotomic\Translatable\Contracts\Translatable as TranslatableContract;
use Astrotomic\Translatable\Translatable;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model implements TranslatableContract
{
    use Translatable;

    public $timestamps = false;

    protected $table = 'settings';

    protected $fillable = [
        'code',
        'value',
        'translatable',
    ];

    public array $translatedAttributes = [
        'lang_value',
    ];

    protected $casts = [
        'translatable' => 'boolean',
    ];

    public function getValueAttribute(): null|string|array
    {
        if ($this->translatable) {
            return $this->getTranslation()?->lang_value;
        }

        $value = $this->attributes['value'] ?? null;

        if (is_json($value)) {
            $decoded = json_decode($value, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return $value;
    }

    public function setValueAttribute($value): void
    {
        if (is_array($value)) {
            $value = json_encode($value);
        }

        $this->attributes['value'] = $value;
    }
}
