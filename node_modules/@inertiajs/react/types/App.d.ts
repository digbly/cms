import { HeadManagerOnUpdateCallback, HeadManagerTitleCallback, Page, PageProps, type ServerHeadOption } from '@inertiajs/core';
import { FunctionComponent, ReactNode } from 'react';
import { ReactComponent } from './types';
export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
    children?: (options: {
        Component: ReactComponent;
        props: PageProps;
        key: number | null;
    }) => ReactNode;
    initialPage: Page<SharedProps>;
    initialComponent?: ReactComponent;
    resolveComponent?: (name: string, page?: Page) => ReactComponent | Promise<ReactComponent>;
    titleCallback?: HeadManagerTitleCallback;
    onHeadUpdate?: HeadManagerOnUpdateCallback;
    defaultLayout?: (name: string, page: Page) => unknown;
    serverHead?: ServerHeadOption;
}
export type InertiaApp = FunctionComponent<InertiaAppProps>;
declare function App<SharedProps extends PageProps = PageProps>({ children, initialPage, initialComponent, resolveComponent, titleCallback, onHeadUpdate, defaultLayout, serverHead, }: InertiaAppProps<SharedProps>): import("react").FunctionComponentElement<import("react").ProviderProps<import("@inertiajs/core").HeadManager | null>>;
declare namespace App {
    var displayName: string;
}
export default App;
