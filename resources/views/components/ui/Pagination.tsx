import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    from?: number | null;
    to?: number | null;
    total?: number;
}

interface PaginationProps {
    meta?: PaginationMeta | null;
    onPageChange: (page: number) => void;
    className?: string;
}

/**
 * Windowed page list: always shows the first, last and current pages with a
 * single gap marker between runs.
 */
function buildPages(current: number, last: number): (number | 'gap')[] {
    if (last <= 7) {
        return Array.from({ length: last }, (_, index) => index + 1);
    }

    const candidates = [1, current - 1, current, current + 1, last].filter(
        (page) => page >= 1 && page <= last
    );
    const unique = [...new Set(candidates)].sort((a, b) => a - b);

    const pages: (number | 'gap')[] = [];
    let previous = 0;

    unique.forEach((page) => {
        if (previous && page - previous > 1) {
            pages.push('gap');
        }

        pages.push(page);
        previous = page;
    });

    return pages;
}

/**
 * Canonical pagination control shared by every admin listing. Renders a
 * summary when the payload exposes `from`/`to`/`total`, otherwise just the
 * page controls.
 */
export default function Pagination({ meta, onPageChange, className = '' }: PaginationProps) {
    const { t } = useTranslation();

    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const { current_page: currentPage, last_page: lastPage, from, to, total } = meta;
    const hasSummary = typeof total === 'number';

    const go = (page: number) => {
        if (page >= 1 && page <= lastPage && page !== currentPage) {
            onPageChange(page);
        }
    };

    const control =
        'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition disabled:pointer-events-none disabled:opacity-40';
    const idle =
        'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800';
    const active = 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30';

    return (
        <nav
            aria-label="Pagination"
            className={`flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 ${
                hasSummary ? 'sm:justify-between' : 'sm:justify-center'
            } ${className}`}
        >
            {hasSummary && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('common.pagination.summary', 'Showing {{from}}-{{to}} of {{total}} items')
                        .replace('{{from}}', String(from ?? 0))
                        .replace('{{to}}', String(to ?? 0))
                        .replace('{{total}}', String(total))}
                </p>
            )}

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => go(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label={t('common.pagination.previous', 'Previous page')}
                    className={`${control} ${idle}`}
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                {buildPages(currentPage, lastPage).map((page, index) =>
                    page === 'gap' ? (
                        <span
                            key={`gap-${index}`}
                            className="flex h-8 min-w-8 items-center justify-center px-1 text-xs text-slate-400"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => go(page)}
                            aria-current={page === currentPage ? 'page' : undefined}
                            className={`${control} ${page === currentPage ? active : idle}`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    type="button"
                    onClick={() => go(currentPage + 1)}
                    disabled={currentPage >= lastPage}
                    aria-label={t('common.pagination.next', 'Next page')}
                    className={`${control} ${idle}`}
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </nav>
    );
}
