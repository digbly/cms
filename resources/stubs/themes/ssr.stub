import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { resolvePage } from './lib/resolve-page';
import { setRoutes } from './lib/route';

const port = Number(process.env.SSR_PORT ?? 13714);
const host = process.env.SSR_HOST ?? '127.0.0.1';

createServer(
    (page) =>
        createInertiaApp({
            page,
            render: ReactDOMServer.renderToString,
            resolve: resolvePage,
            setup({ App, props }) {
                setRoutes(
                    (props.initialPage.props as { routes?: Record<string, string> }).routes ?? {}
                );

                return <App {...props} />;
            },
        }),
    { port, host }
);
