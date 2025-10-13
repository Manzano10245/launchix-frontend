import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        host: '0.0.0.0', // Permite acceso desde otros dispositivos en la red local
        port: 3000,     // Puerto del frontend
        hmr: {
            host: 'localhost',
        },
        proxy: {
            '/api': {
                target: 'http://localhost:8000', // URL del backend
                changeOrigin: true, // Cambia el origen de la solicitud para evitar problemas de CORS
                secure: false,       // Permite conexiones HTTP
            },
        },
    },
});
