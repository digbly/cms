import { CreateInertiaAppOptions, CreateInertiaAppOptionsForCSR, CreateInertiaAppOptionsForSSR, InertiaAppSSRResponse, Page, PageProps, SharedPageProps } from '@inertiajs/core';
import { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { InertiaAppProps, type InertiaApp } from './App';
import { ReactComponent, ReactInertiaAppConfig } from './types';
export type SetupOptions<ElementType, SharedProps extends PageProps> = {
    el: ElementType;
    App: InertiaApp;
    props: InertiaAppProps<SharedProps>;
};
type ComponentResolver = (name: string, page?: Page<SharedPageProps>) => ReactComponent | Promise<ReactComponent> | {
    default: ReactComponent;
};
type ReactWithApp<SharedProps extends PageProps> = (app: ReactElement, options: {
    ssr: boolean;
    page: Page<SharedProps>;
}) => ReactElement;
type InertiaAppOptionsForCSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForCSR<SharedProps, ComponentResolver, SetupOptions<HTMLElement, SharedProps>, void, ReactInertiaAppConfig> & {
    strictMode?: undefined;
    withApp?: never;
};
type InertiaAppOptionsForSSR<SharedProps extends PageProps> = CreateInertiaAppOptionsForSSR<SharedProps, ComponentResolver, SetupOptions<null, SharedProps>, ReactElement, ReactInertiaAppConfig> & {
    render: typeof renderToString;
    strictMode?: undefined;
    withApp?: never;
};
type InertiaAppOptionsAuto<SharedProps extends PageProps> = Omit<CreateInertiaAppOptions<ComponentResolver, SetupOptions<HTMLElement | null, SharedProps>, ReactElement | void, ReactInertiaAppConfig>, 'setup'> & {
    page?: Page<SharedProps>;
    render?: undefined;
    strictMode?: boolean;
} & ({
    setup?: undefined;
    withApp?: ReactWithApp<SharedProps>;
} | {
    setup: (options: SetupOptions<HTMLElement | null, SharedProps>) => ReactElement | void;
    withApp?: never;
});
type RenderToString = (element: ReactElement) => string;
type RenderFunction<SharedProps extends PageProps> = (page: Page<SharedProps>, renderToString: RenderToString) => Promise<InertiaAppSSRResponse>;
export default function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(options: InertiaAppOptionsForCSR<SharedProps>): Promise<void>;
export default function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(options: InertiaAppOptionsForSSR<SharedProps>): Promise<InertiaAppSSRResponse>;
export default function createInertiaApp<SharedProps extends PageProps = PageProps & SharedPageProps>(options?: InertiaAppOptionsAuto<SharedProps>): Promise<void | RenderFunction<SharedProps>>;
export {};
