

<?php

use Illuminate\Support\Facades\Route;

// =============================================
//  FRONTEND DESACOPLADO: RUTAS DE ARCHIVOS HTML
// =============================================
// Este archivo solo sirve archivos HTML estáticos para cada vista principal del frontend.
// Todas las vistas y la lógica de negocio se manejan con JavaScript y peticiones a la API externa.
// No se usan vistas Blade ni controladores que dependan de modelos locales.

// Ruta principal: página de inicio
Route::get('/', function () {
    // Sirve el archivo index.html desde la carpeta public
    return response()->file(public_path('index.html'));
});

// Página de inicio
Route::get('/home', function () {
    // Sirve la vista estática home.html
    return response()->file(resource_path('views/static/home.html'));
});

// Página de productos
Route::get('/products', function () {
    // Sirve la vista estática products.html
    return response()->file(resource_path('views/static/products.html'));
});

// Página de servicios
Route::get('/services', function () {
    // Sirve la vista estática services.html
    return response()->file(resource_path('views/static/services.html'));
});

// Página del carrito
Route::get('/cart', function () {
    // Sirve la vista estática cart.html
    return response()->file(resource_path('views/static/cart.html'));
});

// Página de perfil
Route::get('/profile', function () {
    // Sirve la vista estática profile.html
    return response()->file(resource_path('views/static/profile.html'));
});

// Página de login
Route::get('/login', function () {
    // Sirve la vista estática login.html
    return response()->file(resource_path('views/static/login.html'));
});

// Página de registro
Route::get('/register', function () {
    // Sirve la vista estática register.html
    return response()->file(resource_path('views/static/register.html'));
});