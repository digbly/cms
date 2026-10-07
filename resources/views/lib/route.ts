declare global {
    interface Window {
        __routes?: Record<string, string>;
        route?: typeof route;
    }
}

/**
 * Build a URL from a named route shared by the backend.
 *
 * Values are resolved from `window.__routes` (route name => URI) and any
 * remaining parameters are appended as a query string. Placeholders using
 * `{param}` are replaced in place.
 */
export function route(name: string, params: Record<string, unknown> = {}): string {
    const routes = window.__routes ?? {};
    let url = routes[name];

    if (!url) {
        return name;
    }

    const query: Record<string, unknown> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (url!.includes(`{${key}}`)) {
            url = url!.replace(`{${key}}`, encodeURIComponent(String(value)));
        } else {
            query[key] = value;
        }
    });

    const search = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            search.append(key, String(value));
        }
    });

    const queryString = search.toString();

    if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
    }

    return url;
}

window.route = route;
