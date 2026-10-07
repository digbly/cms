<?php

namespace Themes\Default\Support;

use Modules\Blog\Models\Category;
use Modules\Blog\Models\Comment;
use Modules\Blog\Models\Post;

/**
 * Turns blog models into the plain arrays the theme's Inertia pages consume.
 */
class PostPresenter
{
    /**
     * @return array<string, mixed>
     */
    public static function post(Post $post, bool $withContent = false): array
    {
        $translation = $post->resolvedTranslation();

        $categories = $post->relationLoaded('categories')
            ? $post->categories
            : collect();

        return [
            'id' => $post->getKey(),
            'title' => $translation?->title,
            'slug' => $translation?->slug,
            'description' => $translation?->description,
            'content' => $withContent ? $translation?->content : null,
            'views' => (int) $post->views,
            'author_name' => $post->relationLoaded('author') ? $post->author?->name : null,
            'created_at' => $post->created_at?->toIso8601String(),
            'url' => $translation?->slug
                ? route('default.posts.show', $translation->slug, false)
                : null,
            'categories' => $categories
                ->map(fn (Category $category) => self::category($category))
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function category(Category $category): array
    {
        $translation = $category->resolvedTranslation();

        return [
            'id' => $category->getKey(),
            'name' => $translation?->name,
            'slug' => $translation?->slug,
            'description' => $translation?->description,
            'posts_count' => $category->posts_count ?? null,
            'url' => $translation?->slug
                ? route('default.categories.show', $translation->slug, false)
                : null,
        ];
    }

    /**
     * Recursively present a comment with its (approved) replies.
     *
     * @return array<string, mixed>
     */
    public static function comment(Comment $comment): array
    {
        $replies = $comment->relationLoaded('replies')
            ? $comment->replies
            : collect();

        return [
            'id' => $comment->getKey(),
            'author_name' => $comment->author_name,
            'content' => $comment->content,
            'created_at' => $comment->created_at?->toIso8601String(),
            'replies' => $replies
                ->map(fn (Comment $reply) => self::comment($reply))
                ->values()
                ->all(),
        ];
    }
}
