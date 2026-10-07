import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

/**
 * Rounded surface used for every admin panel/section.
 */
export default function Card({ className = '', children, ...props }: CardProps) {
    return (
        <div
            className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
