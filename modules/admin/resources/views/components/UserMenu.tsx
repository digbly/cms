import { Link } from '@inertiajs/react';
import { ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useDropdown } from '@/hooks/useDropdown';
import { useTranslation } from '@/hooks/useTranslation';
import type { AuthUser } from '@/types';

interface UserMenuProps {
    user: AuthUser | null;
    onLogout: () => void;
}

function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

/**
 * Header account dropdown with profile link and sign-out.
 */
export default function UserMenu({ user, onLogout }: UserMenuProps) {
    const { t } = useTranslation();
    const { open, toggle, setOpen, containerRef, triggerRef, menuRef, onMenuKeyDown } = useDropdown();

    const name = user?.name ?? t('common.userMenu.fallbackName', 'Account');

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-semibold text-white">
                    {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        initials(name)
                    )}
                </span>
                <span className="hidden max-w-[10rem] truncate font-medium text-slate-700 dark:text-slate-200 sm:inline">
                    {name}
                </span>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div
                    ref={menuRef}
                    role="menu"
                    onKeyDown={onMenuKeyDown}
                    className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
                >
                    <div className="px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {user?.email ?? t('common.userMenu.noEmail', 'No email')}
                        </p>
                    </div>

                    <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />

                    <Link
                        href="/profile"
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <UserRound className="h-4 w-4" />
                        {t('common.userMenu.profile', 'Profile')}
                    </Link>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setOpen(false);
                            onLogout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                        <LogOut className="h-4 w-4" />
                        {t('common.userMenu.logout', 'Sign out')}
                    </button>
                </div>
            )}
        </div>
    );
}
