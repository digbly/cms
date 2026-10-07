/**
 * Join an admin base path with a relative target, keeping a single slash.
 */
export function joinUrl(base: string, to?: string | null): string {
    if (!to) {
        return base;
    }

    const path = to.replace(/^\//, '');

    if (path === '') {
        return base;
    }

    return `${base.replace(/\/$/, '')}/${path}`;
}

/**
 * Normalise a URL to its path without query string or trailing slash.
 */
export function normalizePath(url: string): string {
    return (url.split('?')[0] || '/').replace(/\/$/, '') || '/';
}
