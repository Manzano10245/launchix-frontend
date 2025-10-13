@extends('layouts.app')

@section('title', 'Carrito de Compras')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-lighter via-light to-accent pb-12">
    <!-- Breadcrumb -->
    <div class="bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div class="container mx-auto px-4 py-4">
            <nav class="flex items-center space-x-2 text-sm font-medium">
                <a href="/" class="flex items-center gap-2 text-medium hover:text-primary transition-all duration-300 px-3 py-2 rounded-lg hover:bg-accent group">
                    <svg class="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 20.0391 3 19.5304 3 20V9Z"/>
                    </svg>
                    Inicio
                </a>
                <span class="text-gray-300 text-xl">›</span>
                <span class="flex items-center gap-2 text-dark font-bold">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V4H20C20.5523 4 21 4.44772 21 5C21 5.55228 20.5523 6 20 6H19L18.1327 20.1425C18.0579 21.1891 17.187 22 16.1378 22H7.86224C6.81296 22 5.94208 21.1891 5.86732 20.1425L5 6H4C3.44772 6 3 5.55228 3 5C3 4.44772 3.44772 4 4 4H9V2Z"/>
                    </svg>
                    Carrito de Compras
                </span>
            </nav>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Cart Items Section -->
            <div class="lg:col-span-8 space-y-6">
                <!-- Cart Header -->
                <div class="bg-gradient-to-r from-primary via-secondary to-orange rounded-3xl shadow-xl p-8 relative overflow-hidden transform transition-all duration-500 hover:shadow-2xl">
                    <!-- Decorative circles -->
                    <div class="absolute -top-20 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
                    <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    
                    <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div class="flex items-center gap-5">
                            <div class="w-20 h-20 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform transition-transform hover:scale-110 hover:rotate-6">
                                <svg class="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M9 2C9 1.44772 9.44772 1 10 1H14C14.5523 1 15 1.44772 15 2V4H20C20.5523 4 21 4.44772 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.44772 3.44772 4 4 4H9V2Z"/>
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-4xl font-black text-dark drop-shadow-md">Mi Carrito</h1>
                                <div class="flex items-center gap-3 mt-2">
                                    <span class="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-lg">
                                        <span class="text-2xl font-black text-primary" id="cart-item-count">0</span>
                                        <span class="text-sm font-bold text-dark">productos</span>
                                    </span>
                                    <div class="h-6 w-px bg-white/30"></div>
                                    <span class="text-sm font-semibold text-dark/80">Listos para comprar</span>
                                </div>
                            </div>
                        </div>
                        <button id="clear-cart-btn" class="hidden lg:flex items-center gap-3 px-6 py-3.5 bg-white hover:bg-white/95 rounded-xl font-bold text-dark shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 group">
                            <svg class="w-5 h-5 transition-transform group-hover:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"/>
                            </svg>
                            Vaciar carrito
                        </button>
                    </div>
                </div>

                <!-- Products Section -->
                <div class="bg-white rounded-3xl shadow-lg overflow-hidden">
                    <!-- Section Header -->
                    <div class="bg-gradient-to-r from-lighter to-accent p-6 border-b-2 border-accent">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
                                    <svg class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                        <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h2 class="text-2xl font-black text-dark">Productos en el Carrito</h2>
                                    <p class="text-sm text-medium font-semibold">Revisa y gestiona tus artículos</p>
                                </div>
                            </div>
                            <button id="clear-cart-mobile" class="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-sm font-bold text-dark shadow-md hover:shadow-lg transition-all hover:scale-105">
                                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"/>
                                </svg>
                                Vaciar
                            </button>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div id="empty-cart" class="hidden p-16 text-center">
                        <div class="inline-flex w-40 h-40 bg-gradient-to-br from-accent via-light to-primary rounded-full items-center justify-center mb-8 relative animate-pulse-slow">
                            <div class="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-2xl opacity-20"></div>
                            <svg class="w-24 h-24 text-primary relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <path d="M16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11M5 9H19L20 21H4L5 9Z"/>
                            </svg>
                        </div>
                        <h3 class="text-3xl font-black text-dark mb-3">No hay productos en tu carrito</h3>
                        <p class="text-medium text-lg mb-10 max-w-md mx-auto">Explora nuestra tienda y encuentra productos increíbles para agregar a tu carrito</p>
                        <a href="{{ route('productos') }}" class="inline-flex items-center gap-3 bg-gradient-to-r from-primary via-secondary to-orange text-dark px-12 py-5 rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:scale-105 group">
                            <svg class="w-6 h-6 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z"/>
                            </svg>
                            Explorar Productos
                            <svg class="w-5 h-5 transition-transform group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
                            </svg>
                        </a>
                    </div>

                    <!-- Cart Items List -->
                    <div id="cart-items-list" class="divide-y divide-gray-100">
                        <!-- Los productos se cargarán dinámicamente con JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-4 space-y-6">
                <!-- Summary Card -->
                <div class="bg-white rounded-3xl shadow-xl border-2 border-accent overflow-hidden lg:sticky lg:top-24 transform transition-all duration-500 hover:shadow-2xl">
                    <div class="bg-gradient-to-r from-primary to-secondary p-6">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <svg class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01"/>
                                </svg>
                            </div>
                            <h3 class="text-2xl font-black text-dark">Resumen del Pedido</h3>
                        </div>
                    </div>

                    <div class="p-6 space-y-5">
                        <!-- Subtotal -->
                        <div class="flex items-center justify-between py-4 px-4 bg-lighter rounded-xl transition-all duration-300 hover:bg-accent">
                            <span class="flex items-center gap-3 text-medium font-bold">
                                <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5"/>
                                    </svg>
                                </div>
                                Subtotal
                            </span>
                            <span class="font-black text-xl text-dark" id="subtotal-amount">$0.00</span>
                        </div>

                        <!-- Discount -->
                        <div id="discount-row" class="hidden flex items-center justify-between py-4 px-4 bg-green-light rounded-xl transition-all duration-300">
                            <span class="flex items-center gap-3 text-medium font-bold">
                                <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                                    </svg>
                                </div>
                                Descuento
                            </span>
                            <span class="font-black text-xl text-green" id="discount-amount">-$0.00</span>
                        </div>

                        <!-- Divider -->
                        <div class="relative my-6">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t-2 border-dashed border-gray-200"></div>
                            </div>
                            <div class="relative flex justify-center">
                                <span class="px-4 bg-white text-xs font-bold text-gray uppercase tracking-wider">Total</span>
                            </div>
                        </div>

                        <!-- Total -->
                        <div class="flex items-center justify-between py-6 px-5 bg-gradient-to-r from-accent to-light rounded-2xl">
                            <span class="text-xl font-black text-dark">Total a pagar</span>
                            <span class="text-4xl font-black text-primary drop-shadow-md" id="total-amount">$0.00</span>
                        </div>

                        <!-- Coupon -->
                        <div class="pt-6 mt-6 border-t-2 border-gray-100">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 bg-orange-light rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M15 5V7M15 11V13M15 17V19M5 5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5Z"/>
                                    </svg>
                                </div>
                                <span class="text-dark font-black">¿Tienes un cupón?</span>
                            </div>
                            <div class="flex gap-3">
                                <input type="text" id="coupon-input" placeholder="Código de descuento" class="flex-1 px-5 py-3.5 border-2 border-gray-200 rounded-xl font-semibold text-dark placeholder-gray bg-white focus:border-primary focus:bg-lighter focus:ring-4 focus:ring-primary/20 transition-all outline-none">
                                <button id="apply-coupon-btn" class="px-6 py-3.5 bg-gradient-to-r from-orange to-[#FF6B00] text-white rounded-xl font-black hover:-translate-y-1 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                                    Aplicar
                                </button>
                            </div>
                        </div>

                        <!-- Checkout Button -->
                        <button id="checkout-btn" disabled class="w-full mt-6 px-8 py-5 bg-gradient-to-r from-primary via-secondary to-orange text-dark rounded-2xl font-black text-lg uppercase tracking-wide shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:scale-100 flex items-center justify-center gap-3 group relative overflow-hidden">
                            <div class="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <svg class="w-6 h-6 relative z-10 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                            </svg>
                            <span class="relative z-10">Proceder al Pago</span>
                            <svg class="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
                            </svg>
                        </button>

                        <!-- Continue Shopping -->
                        <a href="/" class="w-full mt-3 px-6 py-4 border-2 border-gray-200 bg-white text-medium rounded-xl font-bold hover:border-primary hover:text-primary hover:bg-lighter transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 group">
                            <svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5M5 12L12 19M5 12L12 5"/>
                            </svg>
                            Continuar Comprando
                        </a>
                    </div>
                </div>

                <!-- Trust Badges -->
                <div class="bg-white rounded-2xl shadow-lg p-5 space-y-4">
                    <div class="flex items-center gap-3 text-sm">
                        <div class="w-10 h-10 bg-green-light rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-dark">Compra Segura</p>
                            <p class="text-xs text-light">Protección garantizada</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                        <div class="w-10 h-10 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                        </div>
                        <div>
                            <p class="font-bold text-dark">Envío Rápido</p>
                            <p class="text-xs text-light">Entrega en 24-48h</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes pulse-border {
    0%, 100% { 
        box-shadow: 0 0 0 0 rgba(253, 192, 64, 0.7);
    }
    50% { 
        box-shadow: 0 0 0 15px rgba(253, 192, 64, 0);
    }
}

@keyframes pulse-slow {
    0%, 100% { 
        transform: scale(1);
    }
    50% { 
        transform: scale(1.05);
    }
}

.animate-pulse-border {
    animation: pulse-border 2s infinite;
}

.animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
}

/* Smooth scrollbar */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: var(--lighter);
}

::-webkit-scrollbar-thumb {
    background: var(--primary);
    border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
    background: var(--secondary);
}
</style>

@vite(['resources/js/Cartshoping.js'])
@endsection