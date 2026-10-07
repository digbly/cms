import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

/**
 * Checkbox with an accessible inline label, sized for admin forms.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, className = '', id, ...props }, ref) => {
        const reactId = useId();
        const checkboxId =
            id ?? (label ? `${label.toLowerCase().replace(/\s+/g, '-')}-${reactId.replace(/:/g, '')}` : undefined);

        return (
            <div>
                <label
                    htmlFor={checkboxId}
                    className="flex cursor-pointer items-center gap-3 text-sm text-slate-700 dark:text-slate-200"
                >
                    <input
                        id={checkboxId}
                        ref={ref}
                        type="checkbox"
                        className={`h-4.5 w-4.5 rounded-md border-slate-300 text-indigo-600 transition focus:ring-2 focus:ring-indigo-500/30 dark:border-white/15 dark:bg-slate-900 ${className}`}
                        {...props}
                    />
                    {label && <span>{label}</span>}
                </label>
                {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
