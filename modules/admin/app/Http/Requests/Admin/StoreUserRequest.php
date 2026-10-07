<?php

namespace Modules\Admin\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['name', 'email', 'password', 'password_confirmation'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'John Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
        new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 8, example: 'Secret123!'),
        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'Secret123!'),
        new OA\Property(
            property: 'roles',
            description: 'Spatie role names to assign.',
            type: 'array',
            items: new OA\Items(type: 'string'),
            example: ['editor']
        ),
        new OA\Property(property: 'is_super_admin', type: 'boolean', example: false),
    ]
)]
class StoreUserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'roles' => ['nullable', 'array'],
            'roles.*' => [
                'string',
                Rule::exists('roles', 'name')
                    ->where(fn ($query) => $query->where('guard_name', config('auth.defaults.guard'))),
            ],
            'is_super_admin' => ['nullable', 'boolean'],
        ];
    }
}
