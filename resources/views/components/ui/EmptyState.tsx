import type { ComponentType, ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description?: string;
    icon?: ComponentType<{ className?: string }>;
    action?: ReactNode;
    className?: string;
}

/**
 * Neutral placeholder shown when a list, table or grid has no content.
 */
export default function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
    action,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center px-6 py-14 text-center ${className}`}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                <Icon className="h-6 w-6" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
