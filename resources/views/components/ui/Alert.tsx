import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    children: ReactNode;
    onClose?: () => void;
    className?: string;
}

const variantStyles: Record<AlertVariant, { wrapper: string; icon: string; Icon: typeof Info }> = {
    success: {
        wrapper: 'border-emerald-500/25 bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
        icon: 'text-emerald-500',
        Icon: CheckCircle2,
    },
    error: {
        wrapper: 'border-rose-500/25 bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300',
        icon: 'text-rose-500',
        Icon: XCircle,
    },
    warning: {
        wrapper: 'border-amber-500/25 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300',
        icon: 'text-amber-500',
        Icon: AlertTriangle,
    },
    info: {
        wrapper: 'border-indigo-500/25 bg-indigo-50 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300',
        icon: 'text-indigo-500',
        Icon: Info,
    },
};

export default function Alert({ variant = 'info', title, children, onClose, className = '' }: AlertProps) {
    const { wrapper, icon, Icon } = variantStyles[variant];

    return (
        <div
            role="alert"
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${wrapper} ${className}`}
        >
            <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${icon}`} />

            <div className="flex-1">
                {title && <p className="font-semibold">{title}</p>}
                <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>
            </div>

            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Dismiss"
                    className="rounded-md p-0.5 opacity-60 transition hover:opacity-100"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
