import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    className?: string;
}

/**
 * Standard page title block: heading, optional description, and right-aligned
 * actions (buttons, filters, etc.).
 */
export default function PageHeader({ title, description, actions, className = '' }: PageHeaderProps) {
    return (
        <div className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                )}
            </div>

            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}
