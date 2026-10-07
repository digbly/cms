<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: __CLASS__,
    properties: [
        new OA\Property(property: 'file', type: 'string', format: 'binary', nullable: true),
        new OA\Property(
            property: 'files',
            type: 'array',
            items: new OA\Items(type: 'string', format: 'binary'),
            nullable: true
        ),
        new OA\Property(property: 'title', type: 'string', nullable: true),
        new OA\Property(property: 'alt', type: 'string', nullable: true),
        new OA\Property(property: 'caption', type: 'string', nullable: true),
        new OA\Property(property: 'description', type: 'string', nullable: true),
    ]
)]
class StoreMediaRequest extends FormRequest
{
    /**
     * SVG is intentionally excluded: files are served from the public disk and
     * an uploaded SVG can execute scripts in the site origin (stored XSS).
     */
    public const MIMES = 'jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx';

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
            'file' => ['required_without:files', 'file', 'max:10240', 'mimes:'.self::MIMES],
            'files' => ['required_without:file', 'array', 'max:20'],
            'files.*' => ['file', 'max:10240', 'mimes:'.self::MIMES],
            'title' => ['nullable', 'string', 'max:255'],
            'alt' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
        ];
    }
}
