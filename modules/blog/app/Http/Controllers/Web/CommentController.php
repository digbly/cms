<?php

namespace Modules\Blog\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Admin\Http\Controllers\Web\Concerns\AuthorizesAdmin;
use Modules\Blog\Enums\Permission;
use Modules\Blog\Http\Requests\Admin\IndexCommentRequest;
use Modules\Blog\Http\Requests\Admin\UpdateCommentRequest;
use Modules\Blog\Http\Resources\CommentResource;
use Modules\Blog\Models\Comment;

/**
 * Inertia-facing comment moderation.
 *
 * Mirrors {@see \Modules\Blog\Http\Controllers\Admin\CommentController} for
 * the web surface.
 */
class CommentController extends Controller
{
    use AuthorizesAdmin;

    public function index(IndexCommentRequest $request): Response
    {
        $filters = $request->validated();

        $comments = Comment::query()
            ->with('author')
            ->when(
                $filters['search'] ?? null,
                fn (Builder $query, string $search) => $query->where(
                    fn (Builder $query) => $query->where('content', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                )
            )
            ->when(
                $filters['status'] ?? null,
                fn (Builder $query, string $status) => $query->where('status', $status)
            )
            ->when(
                $filters['post_id'] ?? null,
                fn (Builder $query, string $postId) => $query->where('post_id', $postId)
            )
            ->orderBy($filters['sort'] ?? 'created_at', $filters['direction'] ?? 'desc')
            ->paginate((int) ($filters['per_page'] ?? 15))
            ->withQueryString();

        return Inertia::render('Blog::comments/Index', [
            'title' => __('blog.comments.title'),
            'comments' => CommentResource::collection($comments),
            'filters' => [
                'search' => $filters['search'] ?? null,
                'status' => $filters['status'] ?? null,
            ],
            'abilities' => $this->abilities($request),
        ]);
    }

    public function update(UpdateCommentRequest $request, Comment $comment): RedirectResponse
    {
        $comment->update(['status' => $request->validated('status')]);

        return back()->with('success', __('blog.comments.notices.updated'));
    }

    public function destroy(Comment $comment): RedirectResponse
    {
        $comment->delete();

        return back()->with('success', __('blog.comments.notices.deleted'));
    }

    /**
     * @return array<string, bool>
     */
    protected function abilities(Request $request): array
    {
        return [
            'update' => $this->allows($request, Permission::CommentsUpdate->value),
            'delete' => $this->allows($request, Permission::CommentsDelete->value),
        ];
    }
}
