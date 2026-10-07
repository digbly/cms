import type { ReactNode } from 'react';

export type BadgeVariant =
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'slate'
    | 'indigo'
    | 'violet'
    | 'cyan';

interface BadgeProps {
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
    children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
};

const dotStyles: Record<BadgeVariant, string> = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    cyan: 'bg-cyan-500',
};

/**
 * Infer a cosmetic variant for dynamic role names.
 */
export const roleBadgeVariant = (role: string): BadgeVariant => {
    const normalized = role.toLowerCase();

    if (normalized.includes('admin')) {
        return 'violet';
    }

    if (normalized.includes('editor') || normalized.includes('manager') || normalized.includes('moderator')) {
        return 'cyan';
    }

    return 'slate';
};

export default function Badge({ variant = 'slate', size = 'md', dot = false, children }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantStyles[variant]} ${
                size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
            }`}
        >
            {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />}
            {children}
        </span>
    );
}
