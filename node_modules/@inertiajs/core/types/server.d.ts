import { InertiaAppResponse, Page } from './types';
type AppCallback = (page: Page) => InertiaAppResponse;
type ServerOptions = {
    port?: number;
    host?: string;
    cluster?: boolean;
    formatErrors?: boolean;
};
type Port = number;
declare const _default: (render: AppCallback, options?: Port | ServerOptions) => AppCallback;
export default _default;
