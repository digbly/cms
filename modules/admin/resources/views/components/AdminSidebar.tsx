import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import NavIcon from '@/components/NavIcon';
import { joinUrl, normalizePath } from '@/lib/url';
import type { NavItem } from '@/types';

interface AdminSidebarProps {
    menu: NavItem[];
    base: string;
    /** Current path without query string or trailing slash. */
    currentPath: string;
    /** Icon-only mode for the collapsed desktop rail. */
    collapsed?: boolean;
    /** Ask the parent to expand the rail (e.g. when a group is activated). */
    onExpandRequest?: () => void;
    /** Called after a navigation link is followed (closes the mobile drawer). */
    onNavigate?: () => void;
}

/**
 * Renders the admin navigation tree, including nested groups. Expanded state is
 * local to each instance so the desktop rail and the mobile drawer never share
 * a collapsed layout.
 */
export default function AdminSidebar({
    menu,
    base,
    currentPath,
    collapsed = false,
    onExpandRequest,
    onNavigate,
}: AdminSidebarProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const isActive = (to?: string | null) => {
        if (!to) {
            return false;
        }

        const target = normalizePath(joinUrl(base, to));

        return currentPath === target || currentPath.startsWith(`${target}/`);
    };

    const toggle = (key: string) => {
        setExpanded((previous) => ({ ...previous, [key]: !previous[key] }));
    };

    const renderItem = (item: NavItem) => {
        const active = isActive(item.to) || item.children.some((child) => isActive(child.to));
        const hasChildren = item.children.length > 0;
        const isOpen = expanded[item.key] ?? active;

        const handleGroupClick = () => {
            if (collapsed) {
                onExpandRequest?.();
                setExpanded((previous) => ({ ...previous, [item.key]: true }));

                return;
            }

            toggle(item.key);
        };

        return (
            <li key={item.key}>
                <div
                    className={`group relative flex items-center gap-1 rounded-xl text-sm font-medium transition ${
                        active
                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                    }`}
                >
                    {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
                    )}

                    {item.to ? (
                        <Link
                            href={joinUrl(base, item.to)}
                            onClick={onNavigate}
                            title={collapsed ? item.label : undefined}
                            aria-label={collapsed ? item.label : undefined}
                            className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-2 ${
                                collapsed ? 'justify-center px-0' : ''
                            }`}
                        >
                            <NavIcon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            title={collapsed ? item.label : undefined}
                            aria-label={collapsed ? item.label : undefined}
                            onClick={handleGroupClick}
                            className={`flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-left ${
                                collapsed ? 'justify-center px-0' : ''
                            }`}
                        >
                            <NavIcon name={item.icon} className="h-4.5 w-4.5 shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </button>
                    )}

                    {hasChildren && !collapsed && (
                        <button
                            type="button"
                            onClick={() => toggle(item.key)}
                            aria-label="Toggle group"
                            aria-expanded={isOpen}
                            className="mr-1 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                            <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>

                {hasChildren && isOpen && !collapsed && (
                    <ul className="mt-1 ml-4 space-y-0.5 border-l border-slate-200 pl-3 dark:border-white/10">
                        {item.children.map((child) => {
                            const childActive = isActive(child.to);

                            return (
                                <li key={child.key}>
                                    <Link
                                        href={joinUrl(base, child.to)}
                                        onClick={onNavigate}
                                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                                            childActive
                                                ? 'font-medium text-indigo-600 dark:text-indigo-400'
                                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                                        }`}
                                    >
                                        <NavIcon name={child.icon} className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{child.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">{menu.map(renderItem)}</ul>
        </nav>
    );
}
