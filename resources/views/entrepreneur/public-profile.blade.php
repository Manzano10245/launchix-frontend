@extends('layouts.app')
@section('title', $entrepreneur->business_name ?? ($entrepreneur->first_name . ' ' . $entrepreneur->last_name))
@section('content')

@vite('resources/css/products.css')

    <!-- Overlay para móvil -->
    <div id="sidebarOverlay" class="sidebar-overlay"></div>

    <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col lg:flex-row gap-8">
            <!-- Sidebar de filtros -->
            <aside class="w-80 bg-white rounded-lg shadow-lg sticky-aside filter-sidebar p-6" id="filterSidebar">
                <!-- Header del sidebar -->
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-800">
                        <i class="fas fa-filter text-red-600"></i> Filtros
                    </h3>
                    <button id="closeSidebar" class="lg:hidden text-gray-500 hover:text-red-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <!-- Categorías -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">Categorías</h4>
                    <div class="space-y-2">
                        <button class="filter-btn active w-full text-left px-3 py-2 rounded-lg" data-category="all">
                            Todas las categorías
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="electronica">
                            <i class="fas fa-laptop"></i> Electrónicos
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="ropa">
                            <i class="fas fa-tshirt"></i> Ropa
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="hogar">
                            <i class="fas fa-home"></i> Hogar
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="deportes">
                            <i class="fas fa-football-ball"></i> Deportes
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="libros">
                            <i class="fas fa-book"></i> Libros
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="juguetes">
                            <i class="fas fa-gamepad"></i> Juguetes
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="belleza">
                            <i class="fas fa-palette"></i> Belleza
                        </button>
                        <button class="filter-btn w-full text-left px-3 py-2 rounded-lg" data-category="automotriz">
                            <i class="fas fa-car"></i> Automotriz
                        </button>
                    </div>
                </div>
                <!-- Rango de precios -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">Precio</h4>
                    <div class="space-y-4">
                        <div class="flex items-center space-x-4">
                            <input type="number" id="minPrice" placeholder="Min" class="w-20 px-2 py-1 border rounded text-sm" min="0">
                            <span class="text-gray-500">-</span>
                            <input type="number" id="maxPrice" placeholder="Max" class="w-20 px-2 py-1 border rounded text-sm" min="0">
                        </div>
                    </div>
                </div>
                <!-- Calificación -->
                <div class="mb-6">
                    <h4 class="font-semibold mb-3 text-gray-700">Calificación</h4>
                    <div class="space-y-2">
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rating-filter" data-rating="5">
                            <div class="star-rating">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">(5 estrellas)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rating-filter" data-rating="4">
                            <div class="star-rating">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">(4+ estrellas)</span>
                        </label>
                        <label class="flex items-center space-x-2 cursor-pointer">
                            <input type="checkbox" class="rating-filter" data-rating="3">
                            <div class="star-rating">
                                <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="far fa-star"></i><i class="far fa-star"></i>
                            </div>
                            <span class="text-sm text-gray-600">(3+ estrellas)</span>
                        </label>
                    </div>
                </div>
                <!-- Botón limpiar filtros -->
                <button id="clearFilters" class="btn-secondary w-full py-2 rounded-lg">
                    <i class="fas fa-undo"></i> Limpiar Filtros
                </button>
            </aside>

            <!-- Contenido principal -->
            <div class="flex-1 min-w-0">
                <!-- Header del perfil -->
                <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div class="flex flex-col md:flex-row items-center gap-6">
                        <img src="{{ $avatarUrl }}"
                             alt="{{ $entrepreneur->first_name }}"
                             class="w-32 h-32 rounded-full border-4 border-red-500 object-cover">
                        <div class="flex-1 text-center md:text-left">
                            <h1 class="text-3xl font-bold mb-2">
                                {{ $entrepreneur->business_name ?? ($entrepreneur->first_name . ' ' . $entrepreneur->last_name) }}
                            </h1>
                            <p class="text-gray-600 mb-4">{{ $entrepreneur->first_name }} {{ $entrepreneur->last_name }}</p>
                            <div class="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-600">
                                <div><i class="fas fa-box text-red-500"></i> {{ count($transformedProducts) }} Productos</div>
                                <div><i class="fas fa-concierge-bell text-blue-500"></i> {{ count($transformedServices) }} Servicios</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Header con pestañas -->
                <div class="bg-white rounded-lg shadow-lg mb-8">
                    <!-- Pestañas -->
                    <div class="border-b border-gray-200">
                        <nav class="flex space-x-8" aria-label="Tabs">
                            <button id="productsTab"
                                    class="tab-button active border-b-2 border-red-500 py-4 px-1 font-medium text-red-600"
                                    onclick="switchTab('products')">
                                <i class="fas fa-box mr-2"></i>
                                Productos ({{ count($transformedProducts) }})
                            </button>
                            <button id="servicesTab"
                                    class="tab-button border-b-2 border-transparent py-4 px-1 font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    onclick="switchTab('services')">
                                <i class="fas fa-concierge-bell mr-2"></i>
                                Servicios ({{ count($transformedServices) }})
                            </button>
                        </nav>
                    </div>

                    <!-- Contenido de las pestañas -->
                    <div class="p-6">
                        <div id="productsHeader" class="tab-content">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Productos</h1>
                                    <p class="text-gray-600">Productos de {{ $entrepreneur->business_name ?? ($entrepreneur->first_name . ' ' . $entrepreneur->last_name) }}</p>
                                </div>
                                <div class="mt-4 md:mt-0 flex items-center space-x-4">
                                    <button id="toggleFilters" class="lg:hidden btn-secondary px-4 py-2 rounded-lg">
                                        <i class="fas fa-filter"></i> Filtros
                                    </button>
                                    <select id="sortBy" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                                        <option value="featured">Destacados</option>
                                        <option value="price-low">Precio: Menor a Mayor</option>
                                        <option value="price-high">Precio: Mayor a Menor</option>
                                        <option value="rating">Mejor Calificados</option>
                                        <option value="newest">Más Recientes</option>
                                        <option value="name-asc">Nombre: A-Z</option>
                                        <option value="name-desc">Nombre: Z-A</option>
                                    </select>
                                </div>
                            </div>
                            <!-- Contador de productos -->
                            <div class="mt-4">
                                <span id="productCount" class="text-sm text-gray-600">Cargando productos...</span>
                            </div>
                        </div>

                        <div id="servicesHeader" class="tab-content hidden">
                            <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Servicios</h1>
                                    <p class="text-gray-600">Servicios de {{ $entrepreneur->business_name ?? ($entrepreneur->first_name . ' ' . $entrepreneur->last_name) }}</p>
                                </div>
                                <div class="mt-4 md:mt-0 flex items-center space-x-4">
                                    <select id="sortServicesBy" class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="newest">Más Recientes</option>
                                        <option value="price-low">Precio: Menor a Mayor</option>
                                        <option value="price-high">Precio: Mayor a Menor</option>
                                        <option value="name-asc">Nombre: A-Z</option>
                                        <option value="name-desc">Nombre: Z-A</option>
                                    </select>
                                </div>
                            </div>
                            <!-- Contador de servicios -->
                            <div class="mt-4">
                                <span id="serviceCount" class="text-sm text-gray-600">{{ count($transformedServices) }} servicios encontrados</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading spinner -->
                <div id="loadingSpinner" class="flex justify-center items-center py-12">
                    <div class="loading-spinner">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                </div>

                <!-- Contenido de productos -->
                <div id="productsContent" class="tab-content">
                    <!-- Loading spinner para productos -->
                    <div id="loadingSpinner" class="flex justify-center items-center py-12">
                        <div class="loading-spinner">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                        </div>
                    </div>

                    <!-- Grid de productos -->
                    <div id="productsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 hidden">
                        <!-- Los productos se cargarán dinámicamente aquí -->
                    </div>

                    <!-- Mensaje sin productos -->
                    <div id="noProducts" class="text-center py-12 hidden">
                        <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">No se encontraron productos</h3>
                        <p class="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
                    </div>

                    <!-- Paginación para productos -->
                    <div id="pagination" class="flex justify-center items-center mt-8 space-x-2 hidden">
                        <button id="prevPage" class="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div id="pageNumbers" class="flex space-x-2">
                            <!-- Números de página se generarán dinámicamente -->
                        </div>
                        <button id="nextPage" class="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <!-- Contenido de servicios -->
                <div id="servicesContent" class="tab-content hidden">
                    @if(count($transformedServices) > 0)
                        <!-- Grid de servicios -->
                        <div id="servicesGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            @foreach($transformedServices as $service)
                                <div class="service-card bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    <div class="relative">
                                        <img src="{{ $service['imagen_principal'] }}"
                                             alt="{{ $service['nombre_servicio'] }}"
                                             class="w-full h-48 object-cover"
                                             onerror="this.src='https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Servicio'">
                                        <div class="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                                            {{ $service['categoria'] }}
                                        </div>
                                    </div>
                                    <div class="p-4">
                                        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ $service['nombre_servicio'] }}</h3>
                                        <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ $service['descripcion'] }}</p>

                                        <div class="text-xl font-bold text-red-600 mb-3">
                                            @if($service['precio_base'] > 0)
                                                ${{ number_format($service['precio_base'], 0, ',', '.') }}
                                            @else
                                                Consultar
                                            @endif
                                        </div>

                                        <div class="space-y-2 text-sm text-gray-600">
                                            @if($service['direccion'])
                                                <div class="flex items-center">
                                                    <i class="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                                                    <span class="truncate">{{ $service['direccion'] }}</span>
                                                </div>
                                            @endif
                                            @if($service['telefono'])
                                                <div class="flex items-center">
                                                    <i class="fas fa-phone text-gray-400 mr-2"></i>
                                                    <span>{{ $service['telefono'] }}</span>
                                                </div>
                                            @endif
                                            @if($service['horario_atencion'])
                                                <div class="flex items-center">
                                                    <i class="fas fa-clock text-gray-400 mr-2"></i>
                                                    <span class="truncate">{{ $service['horario_atencion'] }}</span>
                                                </div>
                                            @endif
                                        </div>

                                        @if($service['telefono'])
                                            <div class="mt-4 flex space-x-2">
                                                <a href="tel:{{ preg_replace('/\D/', '', $service['telefono']) }}"
                                                   class="flex-1 bg-yellow-500 text-white px-3 py-2 rounded text-center hover:bg-yellow-600 transition-colors text-sm">
                                                    <i class="fas fa-phone"></i> Llamar
                                                </a>
                                                <a href="https://wa.me/{{ preg_replace('/\D/', '', $service['telefono']) }}?text=Hola, estoy interesado en el servicio {{ urlencode($service['nombre_servicio']) }}"
                                                   target="_blank"
                                                   class="flex-1 bg-green-500 text-white px-3 py-2 rounded text-center hover:bg-green-600 transition-colors text-sm">
                                                    <i class="fab fa-whatsapp"></i> WhatsApp
                                                </a>
                                            </div>
                                        @else
                                            <div class="mt-4">
                                                <button class="w-full bg-gray-400 text-white px-3 py-2 rounded text-sm cursor-not-allowed" disabled>
                                                    <i class="fas fa-info-circle"></i> Sin contacto disponible
                                                </button>
                                            </div>
                                        @endif
                                    </div>
                                </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <!-- Mensaje sin servicios -->
                        <div class="text-center py-12">
                            <i class="fas fa-concierge-bell text-6xl text-gray-300 mb-4"></i>
                            <h3 class="text-xl font-semibold text-gray-600 mb-2">No hay servicios disponibles</h3>
                            <p class="text-gray-500">Este emprendedor aún no ha publicado servicios</p>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Datos JSON para JavaScript -->
    <script id="entrepreneurProductsData" type="application/json">
        @json($transformedProducts)
    </script>
    <script id="entrepreneurServicesData" type="application/json">
        @json($transformedServices)
    </script>

    <!-- Script del perfil -->
@vite('resources/js/entrepreneur-profile.js')

@endsection
