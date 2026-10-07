<?php

namespace App\Models;

use App\Traits\HasThemeField;
use Illuminate\Database\Eloquent\Model;

class ThemeSetting extends Model
{
    use HasThemeField;

    public $timestamps = false;

    protected $table = 'theme_settings';

    protected $fillable = [
        'code',
        'theme',
        'value',
    ];

    public function getValueAttribute(): null|string|array
    {
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
