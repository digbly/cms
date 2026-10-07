/**
 * Error thrown when the server responds with a 4xx or 5xx status code.
 */
export class HttpResponseError extends Error {
    response;
    constructor(response) {
        super(`HTTP error ${response.status}`);
        this.name = 'HttpResponseError';
        this.response = response;
    }
}
/**
 * Error thrown when a request is cancelled/aborted.
 */
export class HttpCancelledError extends Error {
    constructor(message = 'Request was cancelled') {
        super(message);
        this.name = 'HttpCancelledError';
    }
}
/**
 * Error thrown when a network error occurs (e.g., no connection).
 */
export class HttpNetworkError extends Error {
    constructor(message = 'Network error') {
        super(message);
        this.name = 'HttpNetworkError';
    }
}
