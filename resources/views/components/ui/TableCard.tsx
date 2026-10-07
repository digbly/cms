import type { ReactNode } from 'react';
import Card from './Card';

interface TableCardProps {
    head: ReactNode;
    children: ReactNode;
    /** Optional footer, e.g. a pagination control rendered under the table. */
    footer?: ReactNode;
    className?: string;
}

/**
 * Card-backed, horizontally scrollable table with a consistent header row.
 * `children` should be the `<tr>` rows rendered inside the table body.
 */
export default function TableCard({ head, children, footer, className = '' }: TableCardProps) {
    return (
        <Card className={`overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-400">
                        {head}
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">{children}</tbody>
                </table>
            </div>

            {footer && (
                <div className="border-t border-slate-100 dark:border-white/[0.06]">{footer}</div>
            )}
        </Card>
    );
}
