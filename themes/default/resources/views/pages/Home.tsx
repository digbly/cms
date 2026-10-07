import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import BlockRenderer from '@/components/BlockRenderer';
import Pagination from '@/components/Pagination';
import PostCard from '@/components/PostCard';
import type { Block, NavItem, PageTemplate, Paginated, Post, Widget } from '@/types';

interface HomeProps {
    siteName: string;
    siteLogo: string | null;
    messages: Record<string, string>;
    navMenu: NavItem[];
    sidebarWidgets: Widget[];
    heading: string;
    subheading: string | null;
    posts?: Paginated<Post>;
    template: PageTemplate | null;
    blocks: Record<string, Block[]>;
}

export default function Home({
    siteName,
    siteLogo,
    messages,
    navMenu,
    sidebarWidgets,
    heading,
    subheading,
    posts,
    template,
    blocks,
}: HomeProps) {
    const hasBlocks = template !== null && Object.keys(blocks).length > 0;

    return (
        <AppLayout
            siteName={siteName}
            siteLogo={siteLogo}
            navMenu={navMenu}
            sidebarWidgets={sidebarWidgets}
        >
            <Head title={heading} />

            {hasBlocks ? (
                <div className="space-y-10">
                    {Object.entries(template.blocks).map(([container]) => (
                        <div key={container} className="space-y-6">
                            {(blocks[container] ?? []).map((block) => (
                                <BlockRenderer key={block.id} block={block} />
                            ))}
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <header className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {heading}
                        </h1>
                        {subheading && <p className="mt-1 text-sm text-slate-500">{subheading}</p>}
                    </header>

                    {!posts || posts.data.length === 0 ? (
                        <p className="text-sm text-slate-500">{messages.no_posts}</p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {posts.data.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}

                    {posts && <Pagination paginator={posts} />}
                </>
            )}
        </AppLayout>
    );
}
