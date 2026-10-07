import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import CommentForm from '@/components/comments/CommentForm';
import CommentList from '@/components/comments/CommentList';
import Pagination from '@/components/Pagination';
import type { Comment, NavItem, Paginated, Post as PostType, Widget } from '@/types';

interface PostProps {
    siteName: string;
    siteLogo: string | null;
    messages: Record<string, string>;
    navMenu: NavItem[];
    sidebarWidgets: Widget[];
    post: PostType;
    comments: Paginated<Comment>;
    commentStatus: string | null;
}

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

export default function Post({
    siteName,
    siteLogo,
    messages,
    navMenu,
    sidebarWidgets,
    post,
    comments,
    commentStatus,
}: PostProps) {
    return (
        <AppLayout
            siteName={siteName}
            siteLogo={siteLogo}
            navMenu={navMenu}
            sidebarWidgets={sidebarWidgets}
        >
            <Head title={post.title ?? ''} />

            <article>
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-12 text-white">
                    {post.categories.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {post.categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={category.url ?? '#'}
                                    className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                        {post.title}
                    </h1>

                    {post.description && (
                        <p className="mt-3 max-w-2xl text-base leading-7 text-indigo-100">
                            {post.description}
                        </p>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-indigo-100">
                        <span>{post.author_name ?? siteName}</span>
                        <span>•</span>
                        <span>{formatDate(post.created_at)}</span>
                        <span>•</span>
                        <span>
                            {post.views} {messages.views}
                        </span>
                    </div>
                </div>

                <div
                    className="article-content mt-8"
                    dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
                />

                <section id="comments" className="mt-12 border-t border-slate-200 pt-8">
                    <h2 className="text-lg font-bold text-slate-900">
                        {messages.comments} <span className="text-slate-400">({comments.total})</span>
                    </h2>

                    {commentStatus && (
                        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
                            {commentStatus}
                        </p>
                    )}

                    <div className="mt-6">
                        <CommentList postId={post.id} comments={comments.data} />
                    </div>

                    <Pagination paginator={comments} />

                    <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                            {messages.leave_comment}
                        </h3>
                        <CommentForm
                            postId={post.id}
                            submitLabel={messages.submit_comment ?? 'Submit comment'}
                        />
                    </div>
                </section>
            </article>
        </AppLayout>
    );
}
