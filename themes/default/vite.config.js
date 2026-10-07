import path from 'node:path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/views/app.tsx'],
            ssr: 'resources/views/ssr.tsx',
            refresh: ['resources/views/**/*.blade.php'],
            publicDirectory: '../../public',
            buildDirectory: 'themes/default',
            hotFile: path.resolve(import.meta.dirname, '../../public/themes/default/hot'),
            ssrOutputDirectory: '../../bootstrap/ssr/themes/default',
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': `${import.meta.dirname}/resources/views`,
        },
    },
    build: {
        emptyOutDir: true,
    },
});
