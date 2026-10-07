import { Link } from '@inertiajs/react';
import type { Post, Widget } from '@/types';

const formatDate = (value: string | null): string => {
    if (!value) {
        return '';
    }

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export default function RecentPosts({ widget }: { widget: Widget }) {
    const posts = (widget.data.posts as Post[] | undefined) ?? [];

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                {widget.label}
            </h3>

            {posts.length === 0 ? (
                <p className="text-sm text-slate-500">No posts yet.</p>
            ) : (
                <ul className="space-y-3">
                    {posts.map((post) => (
                        <li key={post.id}>
                            <Link
                                href={post.url ?? '#'}
                                className="block text-sm font-medium text-slate-700 transition-colors hover:text-indigo-600"
                            >
                                {post.title}
                            </Link>
                            <span className="text-xs text-slate-400">
                                {formatDate(post.created_at)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
