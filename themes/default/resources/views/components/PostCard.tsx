import { Link } from '@inertiajs/react';
import type { Post } from '@/types';

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

export default function PostCard({ post }: { post: Post }) {
    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">
            <div className="flex flex-1 flex-col p-5">
                {post.categories.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                        {post.categories.map((category) => (
                            <Link
                                key={category.id}
                                href={category.url ?? '#'}
                                className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </div>
                )}

                <h2 className="text-lg font-bold leading-snug tracking-tight text-slate-900">
                    <Link href={post.url ?? '#'} className="hover:text-indigo-600">
                        {post.title}
                    </Link>
                </h2>

                {post.description && (
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-500">
                        {post.description}
                    </p>
                )}

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>{post.author_name ?? ''}</span>
                    <span>{formatDate(post.created_at)}</span>
                </div>
            </div>
        </article>
    );
}
