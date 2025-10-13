@extends('layouts.app')

@section('title', 'Más Vendidos')

@vite(['resources/css/bestsellers.css', 'resources/js/bestsellers.js'])

@section('content')

    <!-- Hero Section Mejorado -->
    <section class="relative overflow-hidden" style="background: linear-gradient(135deg, #FDC040 0%, #FFB800 100%);">
        <div class="container mx-auto px-4 py-20 relative z-10">
            <div class="max-w-4xl mx-auto text-center scroll-animate">
                <span class="inline-flex items-center gap-2 bg-white px-6 py-2.5 rounded-full text-sm font-bold mb-6 shadow-lg" style="color: #1A1A1A;">
                    <svg class="w-5 h-5" style="color: #FFB800;" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Lo más popular de la semana
                </span>
                
                <h1 class="text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-white" style="text-shadow: 0 2px 20px rgba(0,0,0,0.1);">
                    Los Más Vendidos
                </h1>
                
                <p class="text-xl md:text-2xl mb-10 text-white opacity-95 font-medium max-w-2xl mx-auto">
                    Descubre los productos favoritos de nuestra comunidad. Miles de clientes satisfechos respaldan estas elecciones.
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div class="bg-white bg-opacity-95 backdrop-blur-sm px-6 py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
                        <p class="text-sm font-semibold mb-1" style="color: #808080;">Productos vendidos</p>
                        <p class="text-4xl font-black mb-1" style="color: #FFB800;">10,000+</p>
                        <p class="text-xs font-medium" style="color: #4A4A4A;">Este mes</p>
                    </div>
                    
                    <div class="bg-white bg-opacity-95 backdrop-blur-sm px-6 py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
                        <p class="text-sm font-semibold mb-1" style="color: #808080;">Calificación promedio</p>
                        <p class="text-4xl font-black mb-1" style="color: #FFB800;">4.8</p>
                        <div class="flex justify-center gap-0.5">
                            <span class="text-xl">⭐</span>
                            <span class="text-xl">⭐</span>
                            <span class="text-xl">⭐</span>
                            <span class="text-xl">⭐</span>
                            <span class="text-xl">⭐</span>
                        </div>
                    </div>
                    
                    <div class="bg-white bg-opacity-95 backdrop-blur-sm px-6 py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
                        <p class="text-sm font-semibold mb-1" style="color: #808080;">Clientes felices</p>
                        <p class="text-4xl font-black mb-1" style="color: #FFB800;">5,000+</p>
                        <p class="text-xs font-medium" style="color: #4A4A4A;">Y contando</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Decoración de fondo -->
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div class="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <!-- Wave divider -->
        <div class="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto">
                <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFFFFF"/>
            </svg>
        </div>
    </section>

    <!-- Categorías rápidas -->
    <section class="py-12 bg-white">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-3xl md:text-4xl font-black" style="color: #1A1A1A;">Explora por Categoría</h2>
                <a href="{{ route('productos') }}" class="hidden md:flex items-center gap-2 font-semibold hover:gap-3 transition-all" style="color: #FFB800;">
                    Ver todas
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </a>
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                @php
                    $quickCategories = [
                        ['icon' => 'fas fa-laptop', 'name' => 'Tecnología', 'bg' => '#EBF5FF', 'color' => '#2388FF'],
                        ['icon' => 'fas fa-mobile-alt', 'name' => 'Celulares', 'bg' => '#F3E8FF', 'color' => '#9333EA'],
                        ['icon' => 'fas fa-tshirt', 'name' => 'Moda', 'bg' => '#FFE8F0', 'color' => '#EC4899'],
                        ['icon' => 'fas fa-dumbbell', 'name' => 'Deportes', 'bg' => '#EDF2EE', 'color' => '#00B207'],
                        ['icon' => 'fas fa-home', 'name' => 'Hogar', 'bg' => '#FFF3E0', 'color' => '#FF8A00'],
                        ['icon' => 'fas fa-gamepad', 'name' => 'Gaming', 'bg' => '#FFEBEB', 'color' => '#EA4B48'],
                        ['icon' => 'fas fa-book', 'name' => 'Libros', 'bg' => '#EEF2FF', 'color' => '#6366F1'],
                        ['icon' => 'fas fa-heart', 'name' => 'Belleza', 'bg' => '#FFE8E8', 'color' => '#FF6B6B'],
                    ];
                @endphp
                
                @foreach($quickCategories as $cat)
                    <a href="{{ route('productos') }}" 
                        class="group flex flex-col items-center justify-center p-6 rounded-2xl hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300"
                        style="background-color: {{ $cat['bg'] }};">
                        <i class="{{ $cat['icon'] }} text-3xl mb-3 group-hover:scale-110 transition-transform duration-300" style="color: {{ $cat['color'] }};"></i>
                        <span class="text-sm font-bold text-center" style="color: #1A1A1A;">{{ $cat['name'] }}</span>
                    </a>
                @endforeach
            </div>
        </div>
    </section>

    <!-- Sección de productos destacados -->
    <section class="py-16" style="background-color: #FFFEF8;">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl md:text-4xl font-black mb-4" style="color: #1A1A1A;">Productos Destacados</h2>
                <p class="text-lg" style="color: #808080;">Los productos más populares elegidos por nuestra comunidad</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="productsGrid">
                <!-- Los productos se generarán dinámicamente -->
            </div>

            <!-- Botón cargar más -->
            <div class="text-center mt-12">
                <button id="loadMoreBtn" 
                        class="inline-flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        style="background: linear-gradient(135deg, #FDC040, #FFB800); color: #1A1A1A;">
                    Cargar Más Productos
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
            </div>
        </div>
    </section>

    <!-- Sección de Beneficios -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-black text-center mb-4" style="color: #1A1A1A;">¿Por Qué Elegir Nuestros Bestsellers?</h2>
            <p class="text-center mb-12 text-lg" style="color: #808080;">Calidad garantizada en cada compra</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div class="text-center group scroll-animate">
                    <div class="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                        style="background: linear-gradient(135deg, #FFF4D6, #FDC040);">
                        <svg class="w-10 h-10" style="color: #1A1A1A;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3" style="color: #1A1A1A;">Calidad Garantizada</h3>
                    <p class="text-base leading-relaxed" style="color: #808080;">Productos verificados por miles de clientes satisfechos</p>
                </div>

                <div class="text-center group scroll-animate">
                    <div class="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                         style="background: linear-gradient(135deg, #E0F2FE, #2388FF);">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3" style="color: #1A1A1A;">Envío Rápido</h3>
                    <p class="text-base leading-relaxed" style="color: #808080;">Entrega en 24-48 horas en productos más vendidos</p>
                </div>

                <div class="text-center group scroll-animate">
                    <div class="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                         style="background: linear-gradient(135deg, #FFF3E0, #FF8A00);">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3" style="color: #1A1A1A;">Mejor Precio</h3>
                    <p class="text-base leading-relaxed" style="color: #808080;">Precios competitivos en los productos más demandados</p>
                </div>

                <div class="text-center group scroll-animate">
                    <div class="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                         style="background: linear-gradient(135deg, #EDF2EE, #00B207);">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-3" style="color: #1A1A1A;">Recomendados</h3>
                    <p class="text-base leading-relaxed" style="color: #808080;">Elegidos por nuestra comunidad de compradores</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonios -->
    <section class="py-16" style="background-color: #FFFEF8;">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-black text-center mb-4" style="color: #1A1A1A;">Lo Que Dicen Nuestros Clientes</h2>
            <p class="text-center mb-12 text-lg" style="color: #808080;">Experiencias reales de compradores satisfechos</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 scroll-animate">
                    <div class="flex items-center mb-6">
                        <div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg mr-4"
                             style="background: linear-gradient(135deg, #FDC040, #FFB800);">
                            MR
                        </div>
                        <div>
                            <h4 class="font-bold text-lg" style="color: #1A1A1A;">María Rodríguez</h4>
                            <div class="flex gap-1 mt-1">
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                            </div>
                        </div>
                    </div>
                    <p class="text-base leading-relaxed italic" style="color: #4A4A4A;">"Excelente calidad en todos los productos. He comprado varios de los bestsellers y todos superaron mis expectativas. ¡Totalmente recomendado!"</p>
                </div>

                <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 scroll-animate">
                    <div class="flex items-center mb-6">
                        <div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg mr-4"
                            style="background: linear-gradient(135deg, #2388FF, #1E40AF);">
                            JG
                        </div>
                        <div>
                            <h4 class="font-bold text-lg" style="color: #1A1A1A;">Juan García</h4>
                            <div class="flex gap-1 mt-1">
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                            </div>
                        </div>
                    </div>
                    <p class="text-base leading-relaxed italic" style="color: #4A4A4A;">"Envío súper rápido y productos tal como se describen. Los más vendidos realmente valen la pena. La mejor experiencia de compra."</p>
                </div>

                <div class="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 scroll-animate">
                    <div class="flex items-center mb-6">
                        <div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg mr-4"
                             style="background: linear-gradient(135deg, #00B207, #059669);">
                            AL
                        </div>
                        <div>
                            <h4 class="font-bold text-lg" style="color: #1A1A1A;">Ana López</h4>
                            <div class="flex gap-1 mt-1">
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                                <span style="color: #FFB800;">⭐</span>
                            </div>
                        </div>
                    </div>
                    <p class="text-base leading-relaxed italic" style="color: #4A4A4A;">"Me encanta que muestren los productos más vendidos. Me da confianza saber que otros ya los han probado y quedaron satisfechos."</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Call to Action -->
    <section class="py-20 relative overflow-hidden" style="background: linear-gradient(135deg, #FDC040 0%, #FF8A00 100%);">
        <div class="container mx-auto px-4 text-center relative z-10">
            <h2 class="text-4xl md:text-5xl font-black mb-4 text-white" style="text-shadow: 0 2px 20px rgba(0,0,0,0.1);">
                ¿No Encontraste Lo Que Buscabas?
            </h2>
            <p class="text-xl md:text-2xl mb-10 text-white opacity-95 font-medium max-w-2xl mx-auto">
                Explora nuestro catálogo completo con miles de productos disponibles
            </p>
            <a href="{{ route('productos') }}" 
               class="inline-flex items-center gap-3 bg-white px-10 py-5 rounded-xl font-bold text-lg shadow-2xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
               style="color: #1A1A1A;">
                Ver Todos Los Productos
                <svg class="w-6 h-6" style="color: #FFB800;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
            </a>
        </div>
        
        <!-- Decoración de fondo -->
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
    </section>

@endsection