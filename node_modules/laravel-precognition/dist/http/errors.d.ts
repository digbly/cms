import { HttpResponse } from './types.js';
/**
 * Error thrown when the server responds with a 4xx or 5xx status code.
 */
export declare class HttpResponseError extends Error {
    readonly response: HttpResponse;
    constructor(response: HttpResponse);
}
/**
 * Error thrown when a request is cancelled/aborted.
 */
export declare class HttpCancelledError extends Error {
    constructor(message?: string);
}
/**
 * Error thrown when a network error occurs (e.g., no connection).
 */
export declare class HttpNetworkError extends Error {
    constructor(message?: string);
}
