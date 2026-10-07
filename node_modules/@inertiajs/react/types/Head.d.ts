import { FunctionComponent, ReactNode } from 'react';
type InertiaHeadProps = {
    title?: string;
    children?: ReactNode;
};
type InertiaHead = FunctionComponent<InertiaHeadProps>;
declare const Head: InertiaHead;
export default Head;
