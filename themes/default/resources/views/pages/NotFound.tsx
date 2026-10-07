import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { route } from '@/lib/route';
import type { NavItem, Widget } from '@/types';

interface NotFoundProps {
    siteName: string;
    siteLogo: string | null;
    messages: Record<string, string>;
    navMenu: NavItem[];
    sidebarWidgets: Widget[];
}

export default function NotFound({
    siteName,
    siteLogo,
    messages,
    navMenu,
    sidebarWidgets,
}: NotFoundProps) {
    return (
        <AppLayout
            siteName={siteName}
            siteLogo={siteLogo}
            navMenu={navMenu}
            sidebarWidgets={sidebarWidgets}
        >
            <Head title={messages.not_found ?? 'Not found'} />

            <div className="rounded-3xl border border-slate-200 bg-white px-8 py-16 text-center">
                <p className="text-6xl font-black tracking-tight text-indigo-600">404</p>
                <h1 className="mt-4 text-2xl font-bold text-slate-900">
                    {messages.not_found ?? 'Page not found'}
                </h1>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    {messages.not_found_description}
                </p>
                <Link
                    href={route('default.home')}
                    className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                    {messages.back_home ?? 'Back to home'}
                </Link>
            </div>
        </AppLayout>
    );
}
