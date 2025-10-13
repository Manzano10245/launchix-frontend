<?php

use App\Http\Controllers\Auth\EntrepreneurAuthController;
use App\Http\Controllers\Auth\UserAuthController;
use App\Http\Controllers\EntrepreneurProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;



// Página de inicio dinámica
Route::get('/home', [HomeController::class, 'index'])->name('home');

// Bestsellers
Route::get('/bestsellers', function () {
    return view('bestsellers');
})->name('masvendidos');

// Productos - Rutas públicas
Route::get('/products', function () {
    return view('products');
})->name('productos');

// Servicios - Rutas públicas
Route::get('/services', function () {
    return view('services');
})->name('servicios');

// Carrito de compras
Route::get('/shoppingCart', function () {
    return view('shoppingcart');
})->name('shoppingCart');

// Perfil usuario
Route::get('/user', function () {
    return view('profiles.user');
})->name('user');

// Perfil emprendedor
Route::get('/entrepreneur', function () {
    return view('profiles.entrepreneur');
})->name('entrepreneur');

// USER AUTH
Route::get('/login/user', [UserAuthController::class, 'showLogin'])->name('login.user');
Route::get('/register/user', [UserAuthController::class, 'showRegister'])->name('register.user');

// ENTREPRENEUR AUTH
Route::get('/login/entrepreneur', [EntrepreneurAuthController::class, 'showLogin'])->name('login.entrepreneur');
Route::get('/register/entrepreneur', [EntrepreneurAuthController::class, 'showRegister'])->name('register.entrepreneur');

// Dashboard para el emprendedor (con modales y JS)
Route::get('/entrepreneur/services', function () {
    return view('modals.login-items.entrepreneur.ServicesSection');
})->name('entrepreneur.services');

// Perfil de emprendedor
Route::get('/entrepreneur/profile', [EntrepreneurProfileController::class, 'show'])->name('entrepreneur.profile');

// Perfil público del emprendedor
Route::get('/entrepreneur/{id}/profile', [EntrepreneurProfileController::class, 'publicProfile'])
    ->name('entrepreneur.public.profile');

//rutas del perfil de usuario
Route::get('/userProfile', function () {
    return view('modals.login-items.user.ProfileSection');
})->name('profile');

Route::get('/userOrders', function () {
    return view('modals.login-items.user.OrderSection');
})->name('orders');

Route::get('/userReviews', function () {
    return view('modals.login-items.user.ReviewsSection');
})->name('reviews');

Route::get('/userFollowed', function () {
    return view('modals.login-items.user.FollowedStore');
})->name('followed');

Route::get('/userHistory', function () {
    return view('modals.login-items.user.BrowsingHistory');
})->name('history');

Route::get('/userSettings', function () {
    return view('modals.login-items.user.SettingsSection');
})->name('settings');