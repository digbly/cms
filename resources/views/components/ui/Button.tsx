import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
    xs: 'text-xs px-2.5 py-1.5 gap-1.5',
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5',
};

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
        'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 focus-visible:ring-indigo-500',
    secondary:
        'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 dark:text-slate-100 dark:border-slate-700/60 focus-visible:ring-slate-400',
    outline:
        'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 dark:hover:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700 focus-visible:ring-slate-400',
    ghost:
        'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-100 focus-visible:ring-slate-400',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/30 focus-visible:ring-rose-500',
};

export default function Button({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`inline-flex select-none items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : (
                leftIcon
            )}
            <span>{children}</span>
            {!isLoading && rightIcon}
        </button>
    );
}
