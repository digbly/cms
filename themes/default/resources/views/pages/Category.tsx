import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import Pagination from '@/components/Pagination';
import PostCard from '@/components/PostCard';
import type { Category, NavItem, Paginated, Post, Widget } from '@/types';

interface CategoryProps {
    siteName: string;
    siteLogo: string | null;
    messages: Record<string, string>;
    navMenu: NavItem[];
    sidebarWidgets: Widget[];
    category: Category;
    heading: string;
    subheading: string | null;
    posts: Paginated<Post>;
}

export default function Category({
    siteName,
    siteLogo,
    messages,
    navMenu,
    sidebarWidgets,
    heading,
    subheading,
    posts,
}: CategoryProps) {
    return (
        <AppLayout
            siteName={siteName}
            siteLogo={siteLogo}
            navMenu={navMenu}
            sidebarWidgets={sidebarWidgets}
        >
            <Head title={heading} />

            <header className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                    Categories
                </span>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{heading}</h1>
                {subheading && <p className="mt-1 text-sm text-slate-500">{subheading}</p>}
            </header>

            {posts.data.length === 0 ? (
                <p className="text-sm text-slate-500">{messages.no_posts}</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                    {posts.data.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}

            <Pagination paginator={posts} />
        </AppLayout>
    );
}
