import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronsRight, ExternalLink, Menu as MenuIcon, PanelLeft, Sparkles, X } from 'lucide-react';
import AdminSidebar from '@modules/admin/resources/views/components/AdminSidebar';
import UserMenu from '@modules/admin/resources/views/components/UserMenu';
import Alert from '@/components/ui/Alert';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { route } from '@/lib/route';
import { normalizePath } from '@/lib/url';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useTranslation } from '@/hooks/useTranslation';
import type { SharedProps } from '@/types';

interface AdminLayoutProps {
    title?: string;
    children: ReactNode;
}

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

export default function AdminLayout({ title, children }: AdminLayoutProps) {
    const page = usePage<SharedProps>();
    const { url, props } = page;
    const { auth, admin_menu: menu, admin_prefix: prefix, flash } = props;
    const { t } = useTranslation();

    const base = `/${prefix}`;
    const currentPath = normalizePath(url);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
    });
    const [dismissedFlash, setDismissedFlash] = useState(false);
    const drawerRef = useRef<HTMLElement>(null);

    const closeMobile = () => setMobileOpen(false);

    useFocusTrap(mobileOpen, drawerRef, closeMobile);

    useEffect(() => {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0');
    }, [collapsed]);

    useEffect(() => {
        setDismissedFlash(false);
    }, [flash?.success, flash?.error, flash?.warning]);

    const logout = () => {
        router.post('/logout');
    };

    const brand = (
        <Link
            href={route('admin.dashboard')}
            className={`flex h-16 items-center gap-3 px-4 ${collapsed ? 'justify-center px-0' : ''}`}
        >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/30">
                <Sparkles className="h-5 w-5" />
            </span>
            {!collapsed && (
                <span className="min-w-0">
                    <span className="block truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                        {t('common.layout.brand', 'SiteStore')}
                    </span>
                    <span className="block truncate text-[11px] font-medium text-slate-400">
                        {t('common.brandDesc', 'Admin Console')}
                    </span>
                </span>
            )}
        </Link>
    );

    const flashMessages = [
        flash?.success && (
            <Alert key="success" variant="success" onClose={() => setDismissedFlash(true)}>
                {flash.success}
            </Alert>
        ),
        flash?.error && (
            <Alert key="error" variant="error" onClose={() => setDismissedFlash(true)}>
                {flash.error}
            </Alert>
        ),
        flash?.warning && (
            <Alert key="warning" variant="warning" onClose={() => setDismissedFlash(true)}>
                {flash.warning}
            </Alert>
        ),
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
            <Head title={title} />

            <aside
                className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200/70 bg-white/80 backdrop-blur-xl transition-[width] duration-200 dark:border-white/10 dark:bg-slate-950/80 lg:flex ${
                    collapsed ? 'w-20' : 'w-64'
                }`}
            >
                {brand}
                <AdminSidebar
                    menu={menu}
                    base={base}
                    currentPath={currentPath}
                    collapsed={collapsed}
                    onExpandRequest={() => setCollapsed(false)}
                />
            </aside>

            <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 sm:px-6">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
                            onClick={() => setMobileOpen(true)}
                            aria-label={t('common.topbar.openMenu', 'Open navigation menu')}
                        >
                            <MenuIcon className="h-5 w-5" />
                        </button>

                        <button
                            type="button"
                            className="hidden rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:inline-flex"
                            onClick={() => setCollapsed((previous) => !previous)}
                            aria-label={t('common.shell.toggleSidebar', 'Toggle sidebar')}
                        >
                            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                        </button>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link
                            href="/"
                            target="_blank"
                            className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline-flex"
                        >
                            <ExternalLink className="h-4 w-4" />
                            {t('common.shell.viewSite', 'View site')}
                        </Link>

                        <ThemeToggle />

                        <UserMenu user={auth.user} onLogout={logout} />
                    </div>
                </header>

                <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-7xl p-4 sm:p-6 lg:p-8">
                    {!dismissedFlash && flashMessages.length > 0 && (
                        <div className="mb-6 space-y-2">{flashMessages}</div>
                    )}

                    {children}
                </main>
            </div>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={closeMobile}
                    />

                    <aside
                        ref={drawerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={t('common.topbar.openMenu', 'Navigation menu')}
                        className="relative flex w-72 flex-col bg-white dark:bg-slate-950"
                    >
                        <div className="flex h-16 items-center justify-between px-4">
                            <span className="flex items-center gap-2 text-sm font-bold tracking-tight">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white">
                                    <Sparkles className="h-4 w-4" />
                                </span>
                                {t('common.layout.brand', 'SiteStore')}
                            </span>
                            <button
                                type="button"
                                onClick={closeMobile}
                                aria-label={t('common.topbar.closeMenu', 'Close navigation menu')}
                                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <AdminSidebar menu={menu} base={base} currentPath={currentPath} onNavigate={closeMobile} />
                    </aside>
                </div>
            )}
        </div>
    );
}
