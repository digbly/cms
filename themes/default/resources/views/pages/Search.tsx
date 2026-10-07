import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import Pagination from '@/components/Pagination';
import PostCard from '@/components/PostCard';
import { route } from '@/lib/route';
import type { NavItem, Paginated, Post, Widget } from '@/types';

interface SearchProps {
    siteName: string;
    siteLogo: string | null;
    messages: Record<string, string>;
    navMenu: NavItem[];
    sidebarWidgets: Widget[];
    search: string;
    posts: Paginated<Post>;
}

export default function Search({
    siteName,
    siteLogo,
    messages,
    navMenu,
    sidebarWidgets,
    search,
    posts,
}: SearchProps) {
    return (
        <AppLayout
            siteName={siteName}
            siteLogo={siteLogo}
            navMenu={navMenu}
            sidebarWidgets={sidebarWidgets}
        >
            <Head title="Search" />

            <header className="mb-8 space-y-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {messages.search_results?.replace(':query', search) ?? `Search: ${search}`}
                </h1>

                <form action={route('default.search')} method="get" className="flex gap-2">
                    <input
                        type="search"
                        name="q"
                        defaultValue={search}
                        placeholder={messages.search_placeholder ?? 'Search'}
                        className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                    >
                        {messages.search ?? 'Search'}
                    </button>
                </form>
            </header>

            {posts.data.length === 0 ? (
                <p className="text-sm text-slate-500">{messages.no_search_results}</p>
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
