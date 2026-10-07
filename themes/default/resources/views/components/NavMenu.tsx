import { Link } from '@inertiajs/react';
import type { NavItem } from '@/types';
import { route } from '@/lib/route';

const linkClass =
    'rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900';

const dropdownLinkClass =
    'block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900';

/**
 * A menu destination is internal only when it is a root-relative path or an
 * in-page anchor; anything else (absolute, protocol-relative, mailto:, tel:)
 * leaves the app and must use a plain anchor.
 */
const isInternal = (url: string): boolean => url.startsWith('/') || url.startsWith('#');

function NavLink({ item, className }: { item: NavItem; className: string }) {
    const label = item.label ?? '';

    if (!item.url) {
        return <span className={className}>{label}</span>;
    }

    if (!isInternal(item.url)) {
        return (
            <a
                href={item.url}
                target={item.target ?? '_blank'}
                rel="noreferrer"
                className={className}
            >
                {label}
            </a>
        );
    }

    return (
        <Link href={item.url} target={item.target ?? undefined} className={className}>
            {label}
        </Link>
    );
}

function DropdownItems({ items }: { items: NavItem[] }) {
    return (
        <>
            {items.map((child) => (
                <div key={child.id}>
                    <NavLink item={child} className={dropdownLinkClass} />
                    {child.children.length > 0 && (
                        <div className="pl-3">
                            <DropdownItems items={child.children} />
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}

function NavDropdown({ item }: { item: NavItem }) {
    return (
        <div className="group relative">
            <div className={`${linkClass} inline-flex items-center gap-1`}>
                <NavLink item={item} className="inline-flex items-center" />
                <svg
                    className="h-3.5 w-3.5 transition-transform group-hover:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
            <div className="invisible absolute left-0 top-full z-50 min-w-48 translate-y-1 rounded-xl border border-slate-200 bg-white p-1.5 opacity-0 shadow-lg shadow-slate-900/5 transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <DropdownItems items={item.children} />
            </div>
        </div>
    );
}

export default function NavMenu({ items }: { items: NavItem[] }) {
    return (
        <nav className="hidden items-center gap-1 md:flex">
            <Link href={route('default.home')} className={linkClass}>
                All posts
            </Link>
            {items.map((item) =>
                item.children.length > 0 ? (
                    <NavDropdown key={item.id} item={item} />
                ) : (
                    <NavLink key={item.id} item={item} className={linkClass} />
                )
            )}
        </nav>
    );
}
