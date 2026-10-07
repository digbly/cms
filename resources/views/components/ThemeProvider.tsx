import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import {
    applyTheme,
    getStoredTheme,
    persistTheme,
    resolveTheme,
    THEME_STORAGE_KEY,
    type ResolvedTheme,
    type Theme,
} from '@/lib/theme';

interface ThemeContextValue {
    /** Stored preference: light, dark or system. */
    theme: Theme;
    /** The palette currently rendered after resolving `system`. */
    resolvedTheme: ResolvedTheme;
    setTheme: (theme: Theme) => void;
    /** Flip between light and dark, leaving system mode. */
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
        resolveTheme(getStoredTheme())
    );

    const apply = useCallback((next: Theme) => {
        setResolvedTheme(applyTheme(next));
    }, []);

    useEffect(() => {
        apply(theme);

        if (typeof window.matchMedia !== 'function') {
            return;
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const onChange = () => {
            if (theme === 'system') {
                apply('system');
            }
        };

        media.addEventListener('change', onChange);

        return () => media.removeEventListener('change', onChange);
    }, [theme, apply]);

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (event.key !== THEME_STORAGE_KEY) {
                return;
            }

            const next = getStoredTheme();
            setThemeState(next);
        };

        window.addEventListener('storage', onStorage);

        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const setTheme = useCallback(
        (next: Theme) => {
            persistTheme(next);
            setThemeState(next);
        },
        []
    );

    const toggleTheme = useCallback(() => {
        const next: Theme = resolveTheme(theme) === 'dark' ? 'light' : 'dark';
        persistTheme(next);
        setThemeState(next);
    }, [theme]);

    const value = useMemo<ThemeContextValue>(
        () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
        [theme, resolvedTheme, setTheme, toggleTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);

    if (context === null) {
        throw new Error('useTheme must be used within a ThemeProvider.');
    }

    return context;
}
