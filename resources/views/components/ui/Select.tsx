import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
}

/**
 * Native select styled to match the shared input control.
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, className = '', id, children, ...props }, ref) => {
        const reactId = useId();
        const selectId =
            id ?? (label ? `${label.toLowerCase().replace(/\s+/g, '-')}-${reactId.replace(/:/g, '')}` : undefined);

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                    >
                        {label}
                    </label>
                )}
                <select
                    id={selectId}
                    ref={ref}
                    className={`w-full rounded-xl border bg-slate-50/80 px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-150 focus:outline-none focus:ring-2 dark:bg-slate-900/60 dark:text-white ${
                        error
                            ? 'border-rose-500 focus:ring-rose-500'
                            : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-white/[0.08]'
                    } ${className}`}
                    {...props}
                >
                    {children}
                </select>
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
                {hint && !error && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
