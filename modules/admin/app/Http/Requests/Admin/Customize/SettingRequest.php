<?php

namespace Modules\Admin\Http\Requests\Admin\Customize;

use App\Contracts\Setting as SettingContract;
use App\Contracts\ThemeSetting as ThemeSettingContract;
use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    properties: [
        new OA\Property(property: 'locale', type: 'string', nullable: true, example: 'en'),
        new OA\Property(property: 'setting', type: 'object', additionalProperties: true),
        new OA\Property(property: 'theme_setting', type: 'object', additionalProperties: true),
        new OA\Property(property: 'blocks', type: 'object', additionalProperties: true),
        new OA\Property(property: 'widgets', type: 'object', additionalProperties: true),
    ]
)]
class SettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Build the validation rules from the registered setting definitions.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $rules = [
            'locale' => ['nullable', 'string', 'max:10'],
            'setting' => ['sometimes', 'array'],
            'theme_setting' => ['sometimes', 'array'],
            'blocks' => ['sometimes', 'array'],
            'widgets' => ['sometimes', 'array'],
        ];

        foreach (app(SettingContract::class)->settings() as $key => $definition) {
            if ($definition['translatable'] ?? false) {
                $rules["setting.{$key}"] = ['sometimes', 'nullable'];

                continue;
            }

            $rules["setting.{$key}"] = array_merge(['sometimes'], $definition['rules'] ?: ['nullable']);
        }

        foreach (app(ThemeSettingContract::class)->settings() as $key => $definition) {
            $rules["theme_setting.{$key}"] = array_merge(
                ['sometimes'],
                $definition['rules'] ?? ['nullable', 'string']
            );
        }

        return $rules;
    }
}
