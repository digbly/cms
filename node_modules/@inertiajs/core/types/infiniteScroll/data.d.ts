import { UseInfiniteScrollDataManager } from '../types';
export type InfiniteScrollPageIdentifier = string | number | null;
export type InfiniteScrollOnCompleteDetails = {
    page: InfiniteScrollPageIdentifier;
    completed: boolean;
};
export declare const useInfiniteScrollData: (options: {
    getPropName: () => string;
    onBeforeUpdate: () => void;
    onBeforePreviousRequest: () => void;
    onBeforeNextRequest: () => void;
    onCompletePreviousRequest: (
    /** @deprecated Use `details.page` instead. The positional `loadedPage` argument will be removed in the next major version. */
    loadedPage: InfiniteScrollPageIdentifier, details: InfiniteScrollOnCompleteDetails) => void;
    onCompleteNextRequest: (
    /** @deprecated Use `details.page` instead. The positional `loadedPage` argument will be removed in the next major version. */
    loadedPage: InfiniteScrollPageIdentifier, details: InfiniteScrollOnCompleteDetails) => void;
    onReset?: () => void;
}) => UseInfiniteScrollDataManager;
