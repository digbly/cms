import { Link } from '@inertiajs/react';
import type { Paginated } from '@/types';

export default function Pagination<T>({ paginator }: { paginator: Paginated<T> }) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center gap-1.5">
            {paginator.links.map((link, index) =>
                link.url ? (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`inline-flex min-w-9 items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            link.active
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    />
                ) : (
                    <span
                        key={index}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className="inline-flex min-w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400"
                    />
                )
            )}
        </nav>
    );
}
