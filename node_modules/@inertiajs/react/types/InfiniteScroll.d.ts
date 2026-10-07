import { InfiniteScrollActionSlotProps, InfiniteScrollComponentBaseProps, InfiniteScrollRef, InfiniteScrollSlotProps, ReloadOptions } from '@inertiajs/core';
import React from 'react';
interface ComponentProps extends InfiniteScrollComponentBaseProps, Omit<React.HTMLAttributes<HTMLElement>, keyof InfiniteScrollComponentBaseProps | 'children'> {
    children?: React.ReactNode | ((props: InfiniteScrollSlotProps) => React.ReactNode);
    startElement?: string | React.RefObject<HTMLElement | null>;
    endElement?: string | React.RefObject<HTMLElement | null>;
    itemsElement?: string | React.RefObject<HTMLElement | null>;
    previous?: React.ReactNode | ((props: InfiniteScrollActionSlotProps) => React.ReactNode);
    next?: React.ReactNode | ((props: InfiniteScrollActionSlotProps) => React.ReactNode);
    loading?: React.ReactNode | ((props: InfiniteScrollActionSlotProps) => React.ReactNode);
    params?: ReloadOptions;
    onlyNext?: boolean;
    onlyPrevious?: boolean;
}
declare const InfiniteScroll: React.ForwardRefExoticComponent<ComponentProps & React.RefAttributes<InfiniteScrollRef>>;
export default InfiniteScroll;
