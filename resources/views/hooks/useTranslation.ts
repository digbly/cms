import { usePage } from '@inertiajs/react';
import type { SharedProps } from '@/types';

type TranslationValue = string | Record<string, unknown>;

function lookup(source: Record<string, unknown>, path: string[]): TranslationValue | undefined {
    let current: unknown = source;

    for (const segment of path) {
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }

        current = (current as Record<string, unknown>)[segment];
    }

    if (typeof current === 'string' || typeof current === 'object') {
        return current as TranslationValue;
    }

    return undefined;
}

/**
 * Resolve a translation key (e.g. "admin.nav.dashboard") from the shared
 * backend translation tree, falling back to the provided default.
 */
export function useTranslation() {
    const { translations } = usePage<SharedProps>().props;

    const t = (key: string, fallback?: string): string => {
        const [namespace, ...path] = key.split('.');

        if (!namespace || path.length === 0) {
            return fallback ?? key;
        }

        const value = lookup(translations?.[namespace] ?? {}, path);

        if (typeof value === 'string') {
            return value;
        }

        return fallback ?? key;
    };

    return { t };
}
