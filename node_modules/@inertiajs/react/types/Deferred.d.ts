import { ReactNode } from 'react';
interface DeferredSlotProps {
    reloading: boolean;
}
interface DeferredProps {
    children: ReactNode | ((props: DeferredSlotProps) => ReactNode);
    rescue?: ReactNode | ((props: DeferredSlotProps) => ReactNode);
    fallback: ReactNode | (() => ReactNode);
    data: string | string[];
}
declare const Deferred: {
    ({ children, data, rescue, fallback }: DeferredProps): ReactNode;
    displayName: string;
};
export default Deferred;
