import type { Block, Post } from '@/types';
import PostCard from '@/components/PostCard';

export default function Posts({ block }: { block: Block }) {
    const posts = (block.data.posts as Post[] | undefined) ?? [];
    const title = block.data.title as string | undefined;

    return (
        <section className="space-y-6">
            {title && (
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
            )}

            {posts.length === 0 ? (
                <p className="text-sm text-slate-500">No posts yet.</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </section>
    );
}
