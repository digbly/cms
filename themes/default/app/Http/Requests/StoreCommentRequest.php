<?php

namespace Themes\Default\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Blog\Models\Post;

class StoreCommentRequest extends FormRequest
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
        $post = $this->route('post');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'content' => ['required', 'string', 'max:5000'],
            'parent_id' => [
                'nullable',
                'uuid',
                Rule::exists('comments', 'id')->where(
                    fn ($query) => $query->where('post_id', $post instanceof Post ? $post->getKey() : $post)
                ),
            ],
        ];
    }
}
