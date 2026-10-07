import type { HttpRequestConfig, HttpResponse, InternalActiveVisit } from './types';
type VisitRequestHandler = (visit: InternalActiveVisit, config: HttpRequestConfig) => HttpRequestConfig | Promise<HttpRequestConfig>;
type VisitResponseHandler = (visit: InternalActiveVisit, response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
declare class VisitInterceptors {
    protected requestHandlers: VisitRequestHandler[];
    protected responseHandlers: VisitResponseHandler[];
    onVisitRequest(handler: VisitRequestHandler): () => void;
    onVisitResponse(handler: VisitResponseHandler): () => void;
    processRequest(visit: InternalActiveVisit, config: HttpRequestConfig): Promise<HttpRequestConfig>;
    processResponse(visit: InternalActiveVisit, response: HttpResponse): Promise<HttpResponse>;
}
/**
 * @internal Not part of the public API. May change or be removed without notice.
 */
export declare const interceptors: VisitInterceptors;
/**
 * Expose the interceptor registry on the window so development tooling can hook
 * into visit requests and responses from outside the bundle. Gated behind the
 * `dev` option of `createInertiaApp`, so it is inert in production builds.
 *
 * @internal Not part of the public API. May change or be removed without notice.
 */
export declare function exposeInterceptors(): void;
export {};
