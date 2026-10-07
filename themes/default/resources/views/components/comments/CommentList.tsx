import type { Comment } from '@/types';
import CommentForm from '@/components/comments/CommentForm';

const formatDate = (value: string | null): string => {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

function CommentItem({ postId, comment }: { postId: string; comment: Comment }) {
    return (
        <li className="space-y-3">
            <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {comment.author_name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                            {comment.author_name}
                        </span>
                        <span className="text-xs text-slate-400">
                            {formatDate(comment.created_at)}
                        </span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {comment.content}
                    </p>

                    <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-semibold text-indigo-600">
                            Reply
                        </summary>
                        <div className="mt-3">
                            <CommentForm
                                postId={postId}
                                parentId={comment.id}
                                compact
                                submitLabel="Reply"
                            />
                        </div>
                    </details>
                </div>
            </div>

            {comment.replies.length > 0 && (
                <ul className="ml-12 space-y-4 border-l border-slate-200 pl-4">
                    {comment.replies.map((reply) => (
                        <CommentItem key={reply.id} postId={postId} comment={reply} />
                    ))}
                </ul>
            )}
        </li>
    );
}

export default function CommentList({
    postId,
    comments,
}: {
    postId: string;
    comments: Comment[];
}) {
    if (comments.length === 0) {
        return <p className="text-sm text-slate-500">No comments yet.</p>;
    }

    return (
        <ul className="space-y-6">
            {comments.map((comment) => (
                <CommentItem key={comment.id} postId={postId} comment={comment} />
            ))}
        </ul>
    );
}
