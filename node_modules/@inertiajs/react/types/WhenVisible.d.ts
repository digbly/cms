import { ReloadOptions } from '@inertiajs/core';
import { ReactNode } from 'react';
interface WhenVisibleSlotProps {
    fetching: boolean;
}
interface WhenVisibleProps {
    children: ReactNode | ((props: WhenVisibleSlotProps) => ReactNode);
    fallback: ReactNode | (() => ReactNode);
    data?: string | string[];
    params?: ReloadOptions;
    buffer?: number;
    as?: string;
    always?: boolean;
}
declare const WhenVisible: {
    ({ children, data, params, buffer, as, always, fallback }: WhenVisibleProps): ReactNode;
    displayName: string;
};
export default WhenVisible;
