
// =============================================
//  FRONTEND DESACOPLADO: CONFIGURACIÓN DE VITE
// =============================================
// Este archivo configura el proxy para redirigir las peticiones /api al backend Laravel.
// Así puedes usar rutas relativas en fetch/axios y evitar problemas de CORS en desarrollo.
// La variable VITE_API_URL en .env define la URL base del backend para producción.


import { defineConfig } from 'vite';

export default defineConfig({
    appType: 'mpa',
    plugins: [],
    css: {
        // Force Vite to ignore any postcss.config.* and not load PostCSS plugins
        postcss: {
            plugins: [],
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
            overlay: false, // Hide overlay flashes; errors still appear in console
        },
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8001',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
