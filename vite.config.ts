import path from 'node:path';
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/views/app.tsx'],
            refresh: ['resources/views/**/*.blade.php'],
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), 'resources/views'),
            '@modules': path.resolve(process.cwd(), 'modules'),
        },
    },
});
