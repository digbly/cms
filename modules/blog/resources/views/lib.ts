export const LOCALES = ['en', 'vi'] as const;

export const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

export const firstError = (errors: Record<string, string>): string => Object.values(errors)[0] ?? '';
