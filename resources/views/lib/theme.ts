export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'admin-theme';

const THEMES: Theme[] = ['light', 'dark', 'system'];

/**
 * Read the persisted theme preference, defaulting to `system` when nothing
 * valid has been stored yet.
 */
export function getStoredTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'system';
    }

    const value = window.localStorage.getItem(THEME_STORAGE_KEY);

    return THEMES.includes(value as Theme) ? (value as Theme) : 'system';
}

/**
 * Whether the operating system currently prefers a dark color scheme.
 */
export function systemPrefersDark(): boolean {
    return (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
}

/**
 * Collapse a theme preference into the concrete palette that should render.
 */
export function resolveTheme(theme: Theme): ResolvedTheme {
    if (theme === 'system') {
        return systemPrefersDark() ? 'dark' : 'light';
    }

    return theme;
}

/**
 * Apply a theme preference to the document root so Tailwind's `dark` variant
 * and native form controls follow it.
 */
export function applyTheme(theme: Theme): ResolvedTheme {
    const resolved = resolveTheme(theme);

    if (typeof document !== 'undefined') {
        const root = document.documentElement;

        root.classList.toggle('dark', resolved === 'dark');
        root.style.colorScheme = resolved;
    }

    return resolved;
}

export function persistTheme(theme: Theme): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Storage can be unavailable (private mode, disabled cookies).
    }
}
