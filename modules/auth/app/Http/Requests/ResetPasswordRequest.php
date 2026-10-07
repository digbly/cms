<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['token', 'email', 'password', 'password_confirmation'],
    properties: [
        new OA\Property(
            property: 'token',
            type: 'string',
            example: 'abc123token'
        ),
        new OA\Property(
            property: 'email',
            type: 'string',
            format: 'email',
            example: 'admin@example.com'
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
class ResetPasswordRequest extends FormRequest
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
            'token' => ['required', 'string'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
