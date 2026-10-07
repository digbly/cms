import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
        const reactId = useId();
        const inputId =
            id ??
            (label ? `${label.toLowerCase().replace(/\s+/g, '-')}-${reactId.replace(/:/g, '')}` : undefined);

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                    >
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        id={inputId}
                        ref={ref}
                        className={`w-full rounded-xl border bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-150 focus:outline-none focus:ring-2 dark:bg-slate-900/60 dark:text-white ${
                            error
                                ? 'border-rose-500 focus:ring-rose-500'
                                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/[0.08]'
                        } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3.5 flex items-center text-slate-400 dark:text-slate-500">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
                {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
