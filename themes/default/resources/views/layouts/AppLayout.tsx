import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { route } from '@/lib/route';
import type { NavItem, SharedProps, Widget } from '@/types';
import NavMenu from '@/components/NavMenu';
import Sidebar from '@/components/Sidebar';

interface AppLayoutProps {
    title?: string;
    siteName: string;
    siteLogo: string | null;
    navMenu: NavItem[];
    sidebarWidgets: Widget[];
    children: ReactNode;
}

export default function AppLayout({
    title,
    siteName,
    siteLogo,
    navMenu,
    sidebarWidgets,
    children,
}: AppLayoutProps) {
    const { flash } = usePage<SharedProps>().props;
    const notice = flash?.success ?? flash?.error ?? flash?.warning;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3.5">
                    <Link href={route('default.home')} className="flex items-center gap-2.5">
                        <span className="brand-mark flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-indigo-600 text-sm font-black text-white">
                            {siteLogo ? (
                                <img
                                    src={siteLogo}
                                    alt={siteName}
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                (siteName ?? 'L').charAt(0).toUpperCase()
                            )}
                        </span>
                        <span className="text-base font-bold tracking-tight text-slate-900">
                            {siteName}
                        </span>
                    </Link>

                    <NavMenu items={navMenu} />

                    <form action={route('default.search')} method="get" className="hidden sm:block">
                        <div className="relative">
                            <input
                                type="search"
                                name="q"
                                placeholder="Search articles"
                                className="w-44 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 lg:w-60"
                            />
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-3.5-3.5" />
                            </svg>
                        </div>
                    </form>
                </div>
            </header>

            {notice && (
                <div className="border-b border-emerald-200 bg-emerald-50">
                    <div className="mx-auto max-w-6xl px-4 py-2.5 text-sm text-emerald-800">
                        {notice}
                    </div>
                </div>
            )}

            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <main className="min-w-0">
                    {title && (
                        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
                            {title}
                        </h1>
                    )}
                    {children}
                </main>

                <Sidebar widgets={sidebarWidgets} />
            </div>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-slate-500">
                    <span>
                        © {new Date().getFullYear()} {siteName}
                    </span>
                    <Link href={route('default.home')} className="hover:text-slate-700">
                        Back to home
                    </Link>
                </div>
            </footer>
        </div>
    );
}
