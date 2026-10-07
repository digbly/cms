import { Component, FlashData, Page, PageEvent, PageHandler, PageResolver, RouterInitParams, Visit } from './types';
declare class CurrentPage {
    protected page: Page;
    protected swapComponent: PageHandler<any>;
    protected resolveComponent: PageResolver;
    protected onFlashCallback?: (flash: Page['flash']) => void;
    protected componentId: {};
    protected listeners: {
        event: PageEvent;
        callback: VoidFunction;
    }[];
    protected isFirstPageLoad: boolean;
    protected cleared: boolean;
    protected pendingDeferredProps: Pick<Page, 'deferredProps' | 'url' | 'component'> | null;
    protected historyQuotaExceeded: boolean;
    protected optimisticBaseline: Partial<Page['props']>;
    protected pendingOptimistics: {
        id: number;
        callback: (props: Page['props']) => Partial<Page['props']> | void;
    }[];
    protected optimisticCounter: number;
    init<ComponentType = Component>({ initialPage, swapComponent, resolveComponent, onFlash, }: RouterInitParams<ComponentType>): this;
    set(page: Page, { replace, preserveScroll, preserveState, viewTransition, cached, initialRender, visitId, }?: {
        replace?: boolean;
        preserveScroll?: boolean;
        preserveState?: boolean;
        viewTransition?: Visit['viewTransition'];
        cached?: boolean;
        initialRender?: boolean;
        visitId?: string;
    }): Promise<void>;
    setQuietly(page: Page, { preserveState, }?: {
        preserveState?: boolean;
    }): Promise<unknown>;
    clear(): void;
    isCleared(): boolean;
    get(): Page;
    getWithoutFlashData(): Page;
    hasOnceProps(): boolean;
    merge(data: Partial<Page>): void;
    setPropsQuietly(props: Page['props']): Promise<unknown>;
    setFlash(flash: FlashData): void;
    setUrlHash(hash: string): void;
    remember(data: Page['rememberedState']): void;
    swap({ component, page, preserveState, viewTransition, initialRender, }: {
        component: Component;
        page: Page;
        preserveState: boolean;
        viewTransition: Visit['viewTransition'];
        initialRender?: boolean;
    }): Promise<unknown>;
    resolve(component: string, page?: Page): Promise<Component>;
    nextOptimisticId(): number;
    setBaseline(key: string, value: unknown): void;
    updateBaseline(key: string, value: unknown): void;
    hasBaseline(key: string): boolean;
    registerOptimistic(id: number, callback: (props: Page['props']) => Partial<Page['props']> | void): void;
    unregisterOptimistic(id: number): void;
    replayOptimistics(): Partial<Page['props']>;
    pendingOptimisticCount(): number;
    clearOptimisticState(): void;
    isTheSame(page: Page): boolean;
    on(event: PageEvent, callback: VoidFunction): VoidFunction;
    fireEventsFor(event: PageEvent): void;
    mergeOncePropsIntoResponse(response: Page, { force }?: {
        force?: boolean;
    }): void;
}
export declare const page: CurrentPage;
export {};
