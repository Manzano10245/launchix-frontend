@extends('layouts.app')

@section('title', 'Launchix E-commerce')

@section('content')
<div class="container mx-auto px-4 py-8">

    {{-- Hero Carousel Mejorado --}}
    <div class="relative w-full mb-12">
        <div id="heroCarousel" class="relative overflow-hidden rounded-2xl shadow-2xl h-96">
            @php
                $heroBanners = [
                    [
                        'img' => 'https://www.claroshop.com/c/algolia/assets/portada/laptops.webp',
                        'title' => 'OFERTÓN DE TECNOLOGÍA',
                        'desc' => 'Hasta 12 cuotas sin interés',
                        'price' => 'Ahora $399.900',
                        'badge' => '30% OFF'
                    ],
                    [
                        'img' => 'https://phandroid.com/wp-content/uploads/2025/05/Budget-phones-2025-1200x600.jpg',
                        'title' => '¡Lanzamiento de Smartphones!',
                        'desc' => 'Hasta 30% de descuento solo por hoy',
                        'price' => null,
                        'badge' => 'NUEVO'
                    ],
                    [
                        'img' => 'https://img.freepik.com/vector-premium/elementos-fitness-realistas-gimnasio-mujeres-accesorios-ninas-yoga-objetos-diferentes-dispositivos-deportivos-realistas_166005-1631.jpg',
                        'title' => '¡Deportes y Fitness!',
                        'desc' => 'Todo para tu entrenamiento con envío gratis',
                        'price' => null,
                        'badge' => 'ENVÍO GRATIS'
                    ],
                    [
                        'img' => 'https://i.ytimg.com/vi/WJIfj9QmRAo/maxresdefault.jpg',
                        'title' => '¡Moda y Estilo!',
                        'desc' => 'Nuevas colecciones con 2x1 en ropa seleccionada',
                        'price' => null,
                        'badge' => '2x1'
                    ],
                ];
            @endphp
            <div class="relative w-full h-96">
                @foreach($heroBanners as $i => $banner)
                    <div class="hero-slide absolute inset-0 transition-opacity duration-700 ease-in-out {{ $i === 0 ? '' : 'opacity-0' }}" data-hero-slide="{{ $i }}">
                        <div class="w-full h-96 relative overflow-hidden">
                            <img
                                src="{{ $banner['img'] }}"
                                class="w-full h-full object-cover"
                                alt="{{ $banner['title'] }}"
                                loading="lazy"
                                onerror="this.style.display='none'; this.parentElement.innerHTML+='<div class=\'flex items-center justify-center h-full bg-light text-primary font-bold text-xl\'>Imagen no disponible</div>';">
                            
                            {{-- Overlay gradiente --}}
                            <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
                            
                            {{-- Contenido --}}
                            <div class="absolute inset-0 flex flex-col justify-center px-12 max-w-2xl">
                                @if($banner['badge'])
                                    <span class="inline-block w-fit bg-accent text-white px-4 py-1 rounded-full text-sm font-bold mb-4 animate-pulse">
                                        {{ $banner['badge'] }}
                                    </span>
                                @endif
                                <h2 class="text-5xl font-black text-white mb-3 leading-tight drop-shadow-lg">
                                    {{ $banner['title'] }}
                                </h2>
                                <p class="text-xl text-gray-100 mb-6 drop-shadow-md">{{ $banner['desc'] }}</p>
                                @if($banner['price'])
                                    <div class="text-4xl font-black text-white mb-6 drop-shadow-lg">
                                        {{ $banner['price'] }}
                                    </div>
                                @endif
                                <div>
                                    <a href="{{ route('productos') }}" class="inline-block bg-primary hover:bg-secondary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                                        Explorar ahora
                                        <svg class="inline-block w-5 h-5 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
                
                {{-- Flechas con hover transparente a blanco --}}
                <button type="button" id="heroPrev" class="hero-arrow absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-lg z-20 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-110">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button type="button" id="heroNext" class="hero-arrow absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white backdrop-blur-sm rounded-full p-3 shadow-lg z-20 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-110">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>
                
                {{-- Indicadores mejorados --}}
                <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    @foreach($heroBanners as $i => $banner)
                        <button type="button" class="hero-dot h-2 rounded-full transition-all duration-300 {{ $i === 0 ? 'w-12 bg-white' : 'w-2 bg-white/50 hover:bg-white/75' }}" data-hero-dot="{{ $i }}"></button>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    {{-- Categorías rápidas --}}
    <div class="mb-12">
        <h2 class="text-3xl font-black mb-6 text-primary">Explora por Categoría</h2>
        <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            @php
                $quickCategories = [
                    ['icon' => 'fas fa-laptop', 'name' => 'Tecnología', 'color' => 'bg-blue-100 text-blue-600'],
                    ['icon' => 'fas fa-mobile-alt', 'name' => 'Celulares', 'color' => 'bg-purple-100 text-purple-600'],
                    ['icon' => 'fas fa-tshirt', 'name' => 'Moda', 'color' => 'bg-pink-100 text-pink-600'],
                    ['icon' => 'fas fa-dumbbell', 'name' => 'Deportes', 'color' => 'bg-green-100 text-green-600'],
                    ['icon' => 'fas fa-home', 'name' => 'Hogar', 'color' => 'bg-orange-100 text-orange-600'],
                    ['icon' => 'fas fa-gamepad', 'name' => 'Gaming', 'color' => 'bg-red-100 text-red-600'],
                    ['icon' => 'fas fa-book', 'name' => 'Libros', 'color' => 'bg-indigo-100 text-indigo-600'],
                    ['icon' => 'fas fa-heart', 'name' => 'Belleza', 'color' => 'bg-rose-100 text-rose-600'],
                ];
            @endphp
            @foreach($quickCategories as $cat)
                <a href="{{ route('productos') }}" class="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-2xl {{ $cat['color'] }} hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                    <i class="{{ $cat['icon'] }} text-2xl mb-2"></i>
                    <span class="text-xs font-semibold">{{ $cat['name'] }}</span>
                </a>
            @endforeach
        </div>
    </div>

    {{-- Promociones y descuentos mejorados --}}
    <div class="mb-12">
        <h2 class="text-3xl font-black mb-6 text-primary">Promociones Especiales</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @foreach($promos as $promo)
                <div class="group relative rounded-2xl p-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 {{ $promo['bg'] }} overflow-hidden">
                    {{-- Efecto de brillo al hover --}}
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div class="relative z-10">
                        <span class="text-5xl mb-4 {{ $promo['iconColor'] }} transform group-hover:scale-110 transition-transform duration-300 inline-block">
                            <i class="{{ $promo['icon'] }}"></i>
                        </span>
                        <h3 class="font-black text-xl mb-3">{{ $promo['title'] }}</h3>
                        <p class="text-gray-700">{{ $promo['desc'] }}</p>
                    </div>
                </div>
            @endforeach
        </div>
    </div>

    {{-- Banner de beneficios --}}
    <div class="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        @php
            $benefits = [
                ['icon' => 'fas fa-shipping-fast', 'title' => 'Envío Gratis', 'desc' => 'En compras mayores a $50.000'],
                ['icon' => 'fas fa-credit-card', 'title' => '12 Cuotas', 'desc' => 'Sin interés en tarjetas'],
                ['icon' => 'fas fa-undo', 'title' => 'Devolución', 'desc' => '30 días para devolver'],
                ['icon' => 'fas fa-shield-alt', 'title' => 'Compra Segura', 'desc' => 'Protegemos tus datos'],
            ];
        @endphp
        @foreach($benefits as $benefit)
            <div class="bg-lighter border-2 border-light rounded-xl p-6 text-center hover:border-primary transition-all duration-300">
                <i class="{{ $benefit['icon'] }} text-4xl text-primary mb-3"></i>
                <h4 class="font-bold text-lg mb-1">{{ $benefit['title'] }}</h4>
                <p class="text-sm text-gray-600">{{ $benefit['desc'] }}</p>
            </div>
        @endforeach
    </div>

    {{-- Productos destacados mejorados --}}
    <div class="mb-12">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-3xl font-black text-primary">Productos Destacados</h2>
                <p class="text-gray-600 mt-1">Los más vendidos de la semana</p>
            </div>
            <a href="{{ route('productos') }}" class="flex items-center gap-2 text-primary hover:text-secondary font-semibold group transition-colors duration-300">
                Ver todos
                <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
            </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @foreach($featuredProducts as $product)
                <div class="group bg-white rounded-2xl shadow-md hover:shadow-2xl p-5 flex flex-col items-center transition-all duration-300 transform hover:-translate-y-2">
                    <div class="relative w-full mb-4">
                        <img src="{{ $product->image }}" class="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" alt="{{ $product->name }}">
                        <span class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">HOT</span>
                        <div class="absolute top-2 left-2 flex flex-col gap-1">
                            <span class="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">-30%</span>
                        </div>
                    </div>
                    <h3 class="font-bold mb-2 text-center line-clamp-2 h-12">{{ $product->name }}</h3>
                    <div class="mb-2">
                        <span class="text-gray-400 line-through text-sm mr-2">${{ number_format($product->price * 1.3, 2) }}</span>
                        <span class="text-primary text-2xl font-black">${{ number_format($product->price, 2) }}</span>
                    </div>
                    <div class="flex gap-1 mb-3">
                        @for($i = 0; $i < 5; $i++)
                            <i class="fas fa-star text-yellow-400 text-sm"></i>
                        @endfor
                        <span class="text-xs text-gray-500 ml-1">(128)</span>
                    </div>
                    <a href="{{ route('productos.show', $product->id) }}" class="w-full bg-primary hover:bg-secondary text-white px-4 py-3 rounded-xl font-semibold text-center transition-all duration-300 transform group-hover:scale-105">
                        Agregar al carrito
                    </a>
                </div>
            @endforeach
        </div>
    </div>

    {{-- Sección de ofertas del día --}}
    <div class="mb-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-8 text-white shadow-2xl">
        <div class="flex flex-col md:flex-row items-center justify-between">
            <div class="mb-6 md:mb-0">
                <span class="inline-block bg-white text-red-500 px-4 py-2 rounded-full text-sm font-bold mb-3">
                    <i class="fas fa-fire mr-2"></i>OFERTA DEL DÍA
                </span>
                <h2 class="text-4xl font-black mb-2">¡Aprovecha antes que se acabe!</h2>
                <p class="text-xl opacity-90">Descuentos de hasta el 70% en productos seleccionados</p>
            </div>
            <div class="flex gap-4">
                <div class="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-20">
                    <div class="text-3xl font-black" id="hours">12</div>
                    <div class="text-xs uppercase">Horas</div>
                </div>
                <div class="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-20">
                    <div class="text-3xl font-black" id="minutes">34</div>
                    <div class="text-xs uppercase">Minutos</div>
                </div>
                <div class="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-20">
                    <div class="text-3xl font-black" id="seconds">56</div>
                    <div class="text-xs uppercase">Segundos</div>
                </div>
            </div>
        </div>
    </div>

    {{-- Servicios destacados mejorados --}}
    <div class="mb-12">
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-3xl font-black text-primary">Servicios Destacados</h2>
                <p class="text-gray-600 mt-1">Profesionales verificados a tu disposición</p>
            </div>
            <a href="{{ route('servicios') }}" class="flex items-center gap-2 text-primary hover:text-secondary font-semibold group transition-colors duration-300">
                Ver todos
                <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
                </svg>
            </a>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            @foreach($featuredServices as $service)
                <div class="group bg-gradient-to-br from-lighter to-white rounded-2xl shadow-md hover:shadow-2xl p-5 flex flex-col items-center transition-all duration-300 transform hover:-translate-y-2 border-2 border-light hover:border-primary">
                    <div class="relative w-full mb-4">
                        <img src="{{ $service->image }}" class="w-full h-40 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" alt="{{ $service->name }}">
                        <span class="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                            <i class="fas fa-tools mr-1"></i>SERVICIO
                        </span>
                        <span class="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            <i class="fas fa-check-circle mr-1"></i>Verificado
                        </span>
                    </div>
                    <h3 class="font-bold mb-2 text-center line-clamp-2 h-12">{{ $service->name }}</h3>
                    <div class="flex gap-1 mb-2">
                        @for($i = 0; $i < 5; $i++)
                            <i class="fas fa-star text-yellow-400 text-sm"></i>
                        @endfor
                        <span class="text-xs text-gray-500 ml-1">(86)</span>
                    </div>
                    <span class="text-secondary text-xl font-black mb-4">Desde ${{ number_format($service->price, 0) }}</span>
                    <a href="{{ route('servicios') }}" class="w-full bg-secondary hover:bg-primary text-white px-4 py-3 rounded-xl font-semibold text-center transition-all duration-300 transform group-hover:scale-105">
                        Solicitar ahora
                    </a>
                </div>
            @endforeach
        </div>
    </div>

    {{-- Testimonios --}}
    <div class="mb-12">
        <h2 class="text-3xl font-black mb-6 text-primary text-center">Lo que dicen nuestros clientes</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @php
                $testimonials = [
                    [
                        'name' => 'María González',
                        'rating' => 5,
                        'comment' => 'Excelente servicio, los productos llegaron en perfectas condiciones y muy rápido. ¡Totalmente recomendado!',
                        'product' => 'Laptop Dell'
                    ],
                    [
                        'name' => 'Carlos Rodríguez',
                        'rating' => 5,
                        'comment' => 'La atención al cliente es increíble. Resolvieron todas mis dudas y el proceso de compra fue muy fácil.',
                        'product' => 'iPhone 15 Pro'
                    ],
                    [
                        'name' => 'Ana Martínez',
                        'rating' => 5,
                        'comment' => 'Precios competitivos y gran variedad. Ya he realizado varias compras y siempre quedo satisfecha.',
                        'product' => 'Smart TV Samsung'
                    ],
                ];
            @endphp
            @foreach($testimonials as $testimonial)
                <div class="bg-white rounded-2xl shadow-md p-6 border-2 border-light hover:border-primary transition-all duration-300">
                    <div class="flex items-center mb-4">
                        <div class="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mr-3">
                            {{ substr($testimonial['name'], 0, 1) }}
                        </div>
                        <div>
                            <h4 class="font-bold">{{ $testimonial['name'] }}</h4>
                            <div class="flex gap-1">
                                @for($i = 0; $i < $testimonial['rating']; $i++)
                                    <i class="fas fa-star text-yellow-400 text-xs"></i>
                                @endfor
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-700 mb-3">"{{ $testimonial['comment'] }}"</p>
                    <span class="text-sm text-gray-500 italic">Compró: {{ $testimonial['product'] }}</span>
                </div>
            @endforeach
        </div>
    </div>

    {{-- Marcas destacadas --}}
    <div class="mb-12">
        <h2 class="text-3xl font-black mb-6 text-primary text-center">Marcas que confían en nosotros</h2>
        <div class="bg-white rounded-2xl shadow-md p-8">
            <div class="grid grid-cols-3 md:grid-cols-6 gap-8 items-center opacity-60">
                @php
                    $brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Nike', 'Adidas'];
                @endphp
                @foreach($brands as $brand)
                    <div class="text-center font-bold text-2xl text-gray-400 hover:text-primary transition-colors duration-300 cursor-pointer">
                        {{ $brand }}
                    </div>
                @endforeach
            </div>
        </div>
    </div>

    {{-- Newsletter --}}
    <div class="mb-12 bg-gradient-to-br from-lighter to-white rounded-3xl p-10 border-2 border-light">
        <div class="max-w-2xl mx-auto text-center">
            <i class="fas fa-envelope text-5xl text-primary mb-4"></i>
            <h2 class="text-3xl font-black mb-3 text-primary">¡Suscríbete a nuestro newsletter!</h2>
            <p class="text-gray-600 mb-6">Recibe ofertas exclusivas, novedades y descuentos especiales directo en tu correo</p>
            <form class="flex flex-col md:flex-row gap-3 max-w-xl mx-auto">
                <input type="email" placeholder="Tu correo electrónico" class="flex-1 px-6 py-4 rounded-xl border-2 border-light focus:border-primary focus:outline-none transition-colors duration-300" required>
                <button type="submit" class="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 whitespace-nowrap">
                    Suscribirme
                </button>
            </form>
            <p class="text-xs text-gray-500 mt-4">No compartimos tu información. Puedes cancelar en cualquier momento.</p>
        </div>
    </div>

    {{-- Llamado a la acción final mejorado --}}
    <div class="relative bg-gradient-to-r from-primary via-secondary to-accent text-white rounded-3xl p-12 text-center shadow-2xl overflow-hidden">
        {{-- Patrón decorativo --}}
        <div class="absolute inset-0 opacity-10">
            <div class="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div class="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div class="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div class="relative z-10">
            <h2 class="text-4xl font-black mb-4">¡Descubre todo lo que tenemos para ti!</h2>
            <p class="text-xl mb-8 opacity-90">Explora productos, servicios y promociones exclusivas para ti y tu familia.</p>
            <div class="flex flex-wrap justify-center gap-4">
                <a href="{{ route('productos') }}" class="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <i class="fas fa-shopping-bag mr-2"></i>Ver Productos
                </a>
                <a href="{{ route('servicios') }}" class="bg-accent hover:bg-accent/80 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <i class="fas fa-concierge-bell mr-2"></i>Ver Servicios
                </a>
            </div>
        </div>
    </div>
</div>
@endsection

@vite(['resources/css/home.css', 'resources/js/home.js'])