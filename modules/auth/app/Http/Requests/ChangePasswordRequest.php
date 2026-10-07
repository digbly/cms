<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['current_password', 'password', 'password_confirmation'],
    properties: [
        new OA\Property(
            property: 'current_password',
            type: 'string',
            format: 'password',
            example: 'OldPassword123!'
        ),
        new OA\Property(
            property: 'password',
            type: 'string',
            format: 'password',
            example: 'NewPassword123!'
        ),
        new OA\Property(
            property: 'password_confirmation',
            type: 'string',
            format: 'password',
            example: 'NewPassword123!'
        ),
    ]
)]
class ChangePasswordRequest extends FormRequest
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
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
