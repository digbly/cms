import { LinkComponentBaseProps } from '@inertiajs/core';
import { ElementType } from 'react';
interface BaseInertiaLinkProps extends LinkComponentBaseProps {
    as?: ElementType;
    onClick?: (event: React.MouseEvent) => void;
}
export type InertiaLinkProps = BaseInertiaLinkProps & Omit<React.HTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps> & Omit<React.AllHTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps>;
declare const Link: import("react").ForwardRefExoticComponent<BaseInertiaLinkProps & Omit<import("react").HTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps> & Omit<import("react").AllHTMLAttributes<HTMLElement>, keyof BaseInertiaLinkProps> & import("react").RefAttributes<unknown>>;
export default Link;
