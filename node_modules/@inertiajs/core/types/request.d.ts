import { RequestParams } from './requestParams';
import { Response } from './response';
import type { ActiveVisit, Page } from './types';
import { HttpProgressEvent, HttpRequestHeaders } from './types';
export declare class Request {
    protected page: Page;
    protected response: Response;
    protected cancelToken: AbortController;
    protected requestParams: RequestParams;
    protected requestHasFinished: boolean;
    protected optimistic: boolean;
    constructor(params: ActiveVisit, page: Page, { optimistic }?: {
        optimistic?: boolean;
    });
    static create(params: ActiveVisit, page: Page, options?: {
        optimistic?: boolean;
    }): Request;
    isPrefetch(): boolean;
    getUrl(): URL;
    isOptimistic(): boolean;
    isPendingOptimistic(): boolean;
    send(): Promise<void | undefined>;
    protected finish(): void;
    protected fireFinishEvents(): void;
    cancel({ cancelled, interrupted }: {
        cancelled?: boolean;
        interrupted?: boolean;
    }): void;
    protected onProgress(progress: HttpProgressEvent): void;
    protected getHeaders(): HttpRequestHeaders;
}
