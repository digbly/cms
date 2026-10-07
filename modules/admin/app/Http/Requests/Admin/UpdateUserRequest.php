<?php

namespace Modules\Admin\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Auth\Models\User;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    required: ['name', 'email'],
    properties: [
        new OA\Property(property: 'name', type: 'string', maxLength: 255, example: 'John Doe'),
        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'john@example.com'),
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
class UpdateUserRequest extends FormRequest
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
        /** @var User|null $user */
        $user = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->getKey(), $user?->getKeyName()),
            ],
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
