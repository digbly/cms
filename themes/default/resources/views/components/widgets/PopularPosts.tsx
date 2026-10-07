import { Link } from '@inertiajs/react';
import type { Post, Widget } from '@/types';

export default function PopularPosts({ widget }: { widget: Widget }) {
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
                                {post.views} views
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
