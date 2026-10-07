<?php

namespace Themes\Default\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Modules\Blog\Enums\CommentStatus;
use Modules\Blog\Enums\PostStatus;
use Modules\Blog\Models\Comment;
use Modules\Blog\Models\Post;
use Themes\Default\Http\Requests\StoreCommentRequest;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        abort_unless($post->status === PostStatus::Published, 404);

        $data = $request->validated();
        $user = $request->user();

        Comment::create([
            'post_id' => $post->getKey(),
            'parent_id' => $data['parent_id'] ?? null,
            'user_id' => $user?->getKey(),
            'name' => $data['name'] ?? $user?->name,
            'email' => $data['email'] ?? $user?->email,
            'content' => $data['content'],
            'status' => CommentStatus::Pending,
        ]);

        return redirect()
            ->route('default.posts.show', $post->resolvedTranslation()?->slug)
            ->with('comment_status', __('default::messages.comment_pending'));
    }
}
