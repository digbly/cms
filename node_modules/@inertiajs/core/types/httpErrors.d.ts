import { HttpResponse } from './types';
export declare class HttpError extends Error {
    readonly code: string;
    readonly url?: string;
    constructor(message: string, code: string, url?: string);
}
export declare class HttpResponseError extends HttpError {
    readonly response: HttpResponse;
    constructor(message: string, response: HttpResponse, url?: string);
}
export declare class HttpCancelledError extends HttpError {
    constructor(message?: string, url?: string);
}
export declare class HttpNetworkError extends HttpError {
    readonly cause?: Error;
    constructor(message: string, url?: string, cause?: Error);
}
