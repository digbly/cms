import '../assets/css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePage } from './lib/resolve-page';
import { setRoutes } from './lib/route';

createInertiaApp({
    resolve: resolvePage,
    progress: {
        delay: 150,
        color: '#6366f1',
        includeCSS: true,
        showSpinner: true,
    },
    setup({ el, App, props }) {
        const routes = (props.initialPage.props as { routes?: Record<string, string> }).routes;

        setRoutes(routes ?? {});

        createRoot(el).render(<App {...props} />);
    },
});
