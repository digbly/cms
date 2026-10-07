<?php

namespace Modules\Admin\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['password', 'password_confirmation'],
    properties: [
        new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'NewPassword123!'),
        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'NewPassword123!'),
    ]
)]
class ResetUserPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
