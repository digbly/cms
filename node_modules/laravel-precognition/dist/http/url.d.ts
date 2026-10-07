/**
 * Build a query string from params.
 */
export declare function buildQueryString(params: Record<string, unknown>): string;
/**
 * Build the full URL with base URL and query params.
 */
export declare function buildUrl(url: string, baseURL?: string, params?: Record<string, unknown>): string;
