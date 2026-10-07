/**
 * Build a query string from params.
 */
export function buildQueryString(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item) => searchParams.append(`${key}[]`, String(item)));
        }
        else if (typeof value === 'object') {
            searchParams.append(key, JSON.stringify(value));
        }
        else {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
}
/**
 * Build the full URL with base URL and query params.
 */
export function buildUrl(url, baseURL, params) {
    if (baseURL && !url.startsWith('http://') && !url.startsWith('https://')) {
        url = baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
    }
    if (params && Object.keys(params).length > 0) {
        const queryString = buildQueryString(params);
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
    }
    return url;
}
