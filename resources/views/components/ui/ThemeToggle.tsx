import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useDropdown } from '@/hooks/useDropdown';
import { useTranslation } from '@/hooks/useTranslation';
import type { Theme } from '@/lib/theme';

interface ThemeToggleProps {
    className?: string;
}

const options: { value: Theme; labelKey: string; fallback: string; Icon: typeof Sun }[] = [
    { value: 'light', labelKey: 'common.theme.light', fallback: 'Light', Icon: Sun },
    { value: 'dark', labelKey: 'common.theme.dark', fallback: 'Dark', Icon: Moon },
    { value: 'system', labelKey: 'common.theme.system', fallback: 'System', Icon: Monitor },
];

/**
 * Header control that switches between light, dark and system themes.
 */
export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const { t } = useTranslation();
    const { open, toggle, setOpen, containerRef, triggerRef, menuRef, onMenuKeyDown } = useDropdown();

    const TriggerIcon = resolvedTheme === 'dark' ? Moon : Sun;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                ref={triggerRef}
                type="button"
                onClick={toggle}
                aria-label={t('common.theme.toggle', 'Toggle theme')}
                aria-haspopup="menu"
                aria-expanded={open}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
                <TriggerIcon className="h-4.5 w-4.5" />
            </button>

            {open && (
                <div
                    ref={menuRef}
                    role="menu"
                    onKeyDown={onMenuKeyDown}
                    className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/40"
                >
                    {options.map(({ value, labelKey, fallback, Icon }) => {
                        const active = theme === value;

                        return (
                            <button
                                key={value}
                                type="button"
                                role="menuitemradio"
                                aria-checked={active}
                                onClick={() => {
                                    setTheme(value);
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition ${
                                    active
                                        ? 'bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                <span className="flex-1 text-left">{t(labelKey, fallback)}</span>
                                {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
